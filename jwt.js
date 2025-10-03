import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const payload = {
  role: "anon",
  aud: "authenticated",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year
  iss: "dylan"
}

const token = jwt.sign(payload, process.env.JWT_SECRET)
console.log(token)
