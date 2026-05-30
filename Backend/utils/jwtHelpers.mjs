import jwt from 'jsonwebtoken'

import config from '../config/default.mjs'
function prepareSecret(headers, type) {
  const secret =
    type === 'access' ? config.jwtAccessSecret : config.jwtRefreshSecret
  return (
    secret + (headers['user-agent'] || '') + (headers['accept-language'] || '')
  )
}

function parseBearer(bearer, headers, type = 'access') {
  let token
  if (bearer && bearer.startsWith('Bearer ')) {
    token = bearer.slice(7)
  } else {
    throw new Error('No Bearer token')
  }
  try {
    const decoded = jwt.verify(token, prepareSecret(headers, type))
    return decoded
  } catch (err) {
    throw new Error('Invalid token')
  }
}

export function parseAccessBearer(bearer, headers) {
  return parseBearer(bearer, headers, 'access')
}
export function parseRefreshBearer(bearer, headers) {
  return parseBearer('Bearer ' + bearer, headers, 'refresh')
}

function getToken(data, headers, type) {
  const expiresIn =
    type === 'access' ? config.accessExpires : config.refreshExpires
  return jwt.sign(data, prepareSecret(headers, type), {
    expiresIn,
  })
}

export function generateAccessToken(data, headers) {
  return getToken(data, headers, 'access')
}
export function generateRefreshToken(data, headers) {
  return getToken(data, headers, 'refresh')
}
