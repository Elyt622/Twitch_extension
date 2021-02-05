const { ProxyProvider } = require('elrondjs')
const fetch = require("node-fetch");

const provider = new ProxyProvider('https://api.elrond.com')

class Queue {
    constructor() { var a = [], b = 0; this.getLength = function () { return a.length - b; }; this.isEmpty = function () { return 0 == a.length; }; this.enqueue = function (b) { a.push(b); }; this.dequeue = function () { if (0 != a.length) { var c = a[b]; 2 * ++b >= a.length && (a = a.slice(b), b = 0); return c; } }; this.peek = function () { return 0 < a.length ? a[b] : void 0; }; }
};

class Streamer {
    constructor(currentAddress, herotag, balance, lastTransaction) {
        this.currentAddress = currentAddress
        this.herotag = herotag
        this.balance = balance
        this.lastTransaction = lastTransaction
    }
};

class LastTransaction {
    constructor(valueLastTx, dataTx, statusLastTx, lastSender, herotagLastSender){
        this.valueLastTx = valueLastTx
        this.statusLastTx = statusLastTx
        this.lastSender = lastSender
        this.dataTx = dataTx
        this.herotagLastSender = herotagLastSender
    }
};                

let currentAddress = "erd1fdq6nmaa62c0cz8f299ycsz0q8lyfr7q87gqpjwnweux5uu9pqcq68ejhz";  // Put your elrond public address
let currentStreamer = new Streamer(currentAddress, null, null, null);
let queue = new Queue();

function decodeBase64(strToDecode){
    let dataReceive;
    // Decode Data from Base64 to UTF-8
    if(strToDecode != null){
        let buff = Buffer.from(strToDecode, 'Base64');
        dataReceive = buff.toString('utf-8');
    }
    else{
        dataReceive = ''
    }
    return dataReceive;
}

function convertToRealBalance(balanceConvertToReal){
    return balanceConvertToReal/1000000000000000000;
}

function shortHerotag(strHerotag){
    if(strHerotag != null)
        return strHerotag.substr(0, strHerotag.indexOf('.')); 
    else 
        return '';
}

async function getUserByAddress(){
    try {
        let addressStreamer = await provider.getAddress(currentAddress)
        currentStreamer.balance = convertToRealBalance(addressStreamer.balance);
        currentStreamer.herotag = shortHerotag(addressStreamer.username);

    } catch (error) {
        console.log(error);
    }
}

async function fetchLastTxReceive(){
    try {
        await getUserByAddress(currentStreamer)
        const resultsLastTx = await fetch('https://api.elrond.com/transactions?receiver='+currentAddress+'&from=0&size=1')
        const dataLastTxReceive = await resultsLastTx.json();

        let lastTransactionViewerAddress = await dataLastTxReceive[0]['sender'];
        let address = await provider.getAddress(lastTransactionViewerAddress)

        currentStreamer.lastTransaction = new LastTransaction( convertToRealBalance(dataLastTxReceive[0]['value']),
         decodeBase64(dataLastTxReceive[0]['data']), dataLastTxReceive[0]['status'], dataLastTxReceive[0]['sender'], shortHerotag(address.username));

        if(queue.isEmpty()){
            queue.enqueue(dataLastTxReceive[0]['txHash']);
            console.log(currentStreamer)
        }
        else{
            if(queue.peek() != dataLastTxReceive[0]['txHash']){
                queue.enqueue(dataLastTxReceive[0]['txHash']);
                queue.dequeue();
                console.log(currentStreamer)
            }
        }
    } catch (error) {
        console.log(error);
    }
}

setInterval(fetchLastTxReceive, 1000);

