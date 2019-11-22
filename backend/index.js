const StellarSdk = require('stellar-sdk');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config()
const port = 5000;
const bodyParser = require('body-parser');
const app = express();

const NETWORK = {'MAINNET': 'MAIN', 'TESTNET': 'TEST'}
Object.freeze(NETWORK);

const network = process.env.NETWORK;
const server = new StellarSdk.Server(process.env.SERVER_URI);
const public_issuer = process.env.PUBLIC_ISSUER;
const private_issuer = process.env.PRIVATE_ISSUER;
const public_dist = process.env.PUBLIC_DIST;
const private_dist = process.env.PRIVATE_DIST;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/changetrust', async (req, res) => {
    let assetList = req.body;
    let responses = [];
    
    let sequenceNo = -1;
    for(let i = 0; i < assetList.length; i++){
        try {
            const asset = new StellarSdk.Asset(assetList[i].name, public_issuer);

            const accountDetails = await server.accounts().accountId(public_dist).call()
            sequenceNo = accountDetails.sequence;

            const distributorAccount = new StellarSdk.Account(public_dist, sequenceNo.toString())
            
            const transaction = new StellarSdk.TransactionBuilder(distributorAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: network === NETWORK.MAINNET ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
            })
                .addOperation(StellarSdk.Operation.changeTrust({asset}))
                .setTimeout(30)
                .build()
            transaction.sign(StellarSdk.Keypair.fromSecret(private_dist))
            const transactionStatus = await server.submitTransaction(transaction);
            responses.push({...transactionStatus});
        } catch(err) {
            responses.push({...err})
        }
    }
    res.send(responses);
})

app.post('/payment', async (req, res) => {
    let assetList = req.body;
    let responses = [];

    let sequenceNo = -1;
    for(let i = 0; i < assetList.length; i++) {
        try {
            const asset = new StellarSdk.Asset(assetList[i].name, public_issuer)

            const accountDetails = await server.accounts().accountId(public_issuer).call()
            sequenceNo = accountDetails.sequence;

            const issuerAccount = new StellarSdk.Account(public_issuer, sequenceNo.toString())

            const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: network === NETWORK.MAINNET ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
            })
                .addOperation(StellarSdk.Operation.payment({
                    destination: public_dist,
                    asset,
                    amount: assetList[i].amount.toString()
                }))
                .setTimeout(30)
                .build()
            transaction.sign(StellarSdk.Keypair.fromSecret(private_issuer))
            const transactionStatus = await server.submitTransaction(transaction)
            responses.push({...transactionStatus})
        } catch(err) {
            responses.push({...err})
        }
    }
    res.send(responses)

    // server.accounts()
    //     .accountId(public_issuer)
    //     .call()
    //     .then(({ sequence }) => {
    //         const asset = new StellarSdk.Asset(assetList.name, public_issuer)

    //         const issuerAccount = new StellarSdk.Account(public_issuer, sequence)

    //         const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
    //             fee: StellarSdk.BASE_FEE,
    //             networkPassphrase: network === NETWORK.MAINNET ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
    //         })
    //             .addOperation(StellarSdk.Operation.payment({
    //                 destination: public_dist,
    //                 asset,
    //                 amount: assetList.amount.toString()
    //             }))
    //             .setTimeout(30)
    //             .build()
    //         transaction.sign(StellarSdk.Keypair.fromSecret(private_issuer))
    //         return server.submitTransaction(transaction)
    //     })
    //     .then(results => {
    //         res.send(results)
    //     })
})

app.listen(port, () => console.log('App is listening on ', port));