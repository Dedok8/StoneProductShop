import http from 'http'

const probe = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/sellers',
    method: 'GET'
  }

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`)
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
  })

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`)
  })

  req.end()
}

probe()
