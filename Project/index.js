// const StellarSdk = require('stellar-sdk')
const axios = require('axios').default
const xlsx = require('xlsx')
const fs = require('fs')    
// const dotenv = require('dotenv');
// dotenv.config()

// const NETWORK = {'MAINNET': 'MAIN', 'TESTNET': 'TEST'}
// Object.freeze(NETWORK);

// const network = process.env.NETWORK
// const server = new StellarSdk.Server(process.env.SERVER_URI)

let assetList = [];
try {
    assetList = fs.readFileSync('Token_List.json')
    assetList = JSON.parse(assetList)
    // Test Request
    // axios.get('http://localhost:5000/').then((response) => console.log(response.data))

    // Change Trust Transaction Request
    axios.post('http://localhost:5000/changetrust', [{"name":"miCoin","amount":100000000},{"name":"miALL","amount":1000000000}])
        .then((response) => console.log(response.data))
    
    // Payment Transaction Request
    // axios.post('http://localhost:5000/payment', [{"name":"miCoin","amount":100000000}, {"name":"miALL","amount":1000000000}])
    //     .then((response) => console.log(response.data))
    
        // changeTrustTransaction()
    // paymentTransaction()
} catch(err) {
    console.log(err)
    console.log('Reading from xlsx now')
    readFromXLSX('miCoin - Final Batch.xlsx')
}

async function readFromXLSX(fileName) {
    var workBook = await xlsx.readFile(fileName)
    const excelFile = workBook.Sheets['Sheet1']

    let i = 2;
    let arr = [];
    while(i <= 92) {
        change = excelFile['D' + i.toString()].v;
        change = change.replace("M", "000000");
        change = change.replace("B", "000000000");
        change = parseInt(change);
        obj = {
            name: excelFile['C' + i.toString()].v,
            amount: change
        }
        arr.push({...obj})
        i = parseInt(i);
        i++;
    }
    var json = JSON.stringify(arr)
    fs.writeFileSync('Token_List.json', json)
}

// async function changeTrustTransaction() {
//     let sequenceNo = -1
//     for(let i = 0; i < assetList.length; i++){
//         try {
//             const asset = new StellarSdk.Asset(assetList[i].name, process.env.PUBLIC_ISSUER)

//             const accountDetails =  await server.accounts().accountId(process.env.PUBLIC_DIST).call()
//             console.log(' Transaction Nonce ', accountDetails)
//             sequenceNo = accountDetails.sequence

//             const distributorAccount = new StellarSdk.Account( process.env.PUBLIC_DIST, sequenceNo)        
//             console.log(distributorAccount)
            
//             const transaction = new StellarSdk.TransactionBuilder(distributorAccount, {
//                 fee: StellarSdk.BASE_FEE,
//                 networkPassphrase: network === NETWORK.MAINNET ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
//             })
//                 .addOperation(StellarSdk.Operation.changeTrust({asset: asset}))
//                 .setTimeout(30)
//                 .build()
//             transaction.sign(StellarSdk.Keypair.fromSecret(process.env.PRIVATE_DIST))
//             const transactionStatus = await server.submitTransaction(transaction)
//             console.log('Transaction Status ', transactionStatus)

//         } catch(err) {
//             console.log('Error in sending transaction ', err)
//         }
//     }
// }

// async function paymentTransaction() {
//     let sequenceNo = -1;
//     for(let i = 1; i < assetList.length; i++) {
//         try {
//             const asset = new StellarSdk.Asset(assetList[i].name, process.env.PUBLIC_ISSUER)

//                 const accountDetails = await server.accounts().accountId(process.env.PUBLIC_ISSUER).call()
//                 sequenceNo = accountDetails.sequence
//                 console.log('Transaction Nounce ', sequenceNo)

//             const issuerAccount = new StellarSdk.Account(process.env.PUBLIC_ISSUER, sequenceNo.toString())
//             const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
//                 fee: StellarSdk.BASE_FEE,
//                 networkPassphrase: network === NETWORK.MAINNET ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
//             })
//                 .addOperation(StellarSdk.Operation.payment({
//                     destination: process.env.PUBLIC_DIST,
//                     asset: asset,
//                     amount: assetList[i].amount.toString()
//                 }))
//                 .setTimeout(30)
//                 .build()
            
//             transaction.sign(StellarSdk.Keypair.fromSecret(process.env.PRIVATE_ISSUER))
//             const transactionStatus = await server.submitTransaction(transaction)
//             console.log('Transaction Status ', transactionStatus)
//         } catch(err) {
//             console.log('Error in sending transaction ', err)
//         }
//     }
// }