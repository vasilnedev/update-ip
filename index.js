const http  = require('http')
const https = require('https')
const express = require('express')
const config = require('./config.json')

/* 
    Global runtime variables
*/
let runtime = {
    latestIp : '',
    lastCheck: null,
    lastUpdate: null,
    lastFulfilled: 0,
    lastRejected: 0,
    ipCheckerIndex : 0
}

/*
    Send a request to a public IP echo service that responds with your public IP address in plain text. If the IP address differs from the latest recorded IP address, call the 'updateIP' function.
*/
const checkIp = reqOptions => {
    console.log( `Checking IP on ${ reqOptions.hostname }` )
    runtime.lastCheck = new Date()
    const req = http.request( reqOptions , res => {
        let resIp = ''
        res.on( 'data' , data => resIp += data )
        res.on( 'end' , () => {
            console.log( `Current IP: ${ resIp }` )
            if( res.statusCode == 200 && runtime.latestIp != resIp ) updateIp( resIp )
        } )
    })
    req.on('error', err => { console.error( err )} )
    req.end()
} 

/*
    When the 'checkIp' function detects a new IP address, send API requests to the dynamic DNS services to update the IP address for the specified domains by calling 'updateDomain' function.
*/
const updateIp = ip => {
    console.log( `Updating new ip ${ip}` )
    runtime.latestIp = ip // Update the global IP address variable
    runtime.lastUpdate = new Date()
    runtime.lastFulfilled = 0
    runtime.lastRejected = 0
    
    if(config.ipUpdaters && config.ipUpdaters.length > 0 ){
        let domainUpdaters = []
        config.ipUpdaters.forEach( ipUpdater => {
            domainUpdaters.push( updateDomain( ipUpdater , ip ) )
        })

        Promise.allSettled( domainUpdaters )
        .then( results => results.forEach( result  => {
            if( result.status == 'fulfilled' ) runtime.lastFulfilled++
            else runtime.lastRejected++
        }))
    }else{
        console.error( 'No IP updaters found!' )
    }
}

/*
    Send a request to a dynamic DNS service to update the IP address for the specified domain. The 'ipUpdater' object contains the domain name and the API request options.
*/
const updateDomain = ( ipUpdater , ip ) =>{
    return new Promise( ( resolve , reject ) => {
        const reqData = JSON.stringify({
            name: ipUpdater.domainName,
            ipv4Address : ip
        })
        let reqOptions = JSON.parse( JSON.stringify( ipUpdater.reqOptions )) // deep copy the request options from a config ipUpdater
        reqOptions.headers['Content-Length'] = reqData.length // add a content length header

        let resData = ''
        const req = https.request( reqOptions , res => {
            res.on( 'data' , data => resData += data )
            res.on( 'end' , () => resolve( resData ) )
        })
        req.on( 'error' , err => reject( err ) )
        req.write( reqData )
        req.end()
    })
}

/* 
    Monitor IP address changes by cycling through multiple public IP echo services.
*/
const runCheckIp = () => {
    if( config.ipCheckers && config.ipCheckers.length > 0 ){
        checkIp( config.ipCheckers[ runtime.ipCheckerIndex ] )
        if( ( runtime.ipCheckerIndex+1 ) < config.ipCheckers.length ) runtime.ipCheckerIndex++
        else runtime.ipCheckerIndex = 0
    }else{
        console.error( 'No IP checkers found!' )
    }
}

/* 
    Start the IP updating loop
*/
console.log( 'Starting IP updating loop...' )
runCheckIp()
setInterval( runCheckIp , config.interval )

// Start an Express server to expose the runtime variables
const app = express()
app.get( '/' , ( req , res ) => {
    res.json( runtime )
})

app.get( '/config' , ( req , res ) => {
    res.json( config )
})

app.get( '/health' , ( req , res ) => {
    res.status(200).send('OK')
})

app.listen( config.port , () => {
    console.log( `Server started on port ${config.port}` )
})
