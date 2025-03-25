const express = require('express')

const app = express()

const port = process.env.NODE_PORT || 3000

app.get( '/' , ( req , res ) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.write( req.ip )
    res.send()
})

app.listen( port , '0.0.0.0' )
