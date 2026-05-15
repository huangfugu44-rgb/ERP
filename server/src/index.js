const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const { 
  authRoutes,
  dashboardRoutes,
  retailRoutes,
  purchaseRoutes,
  salesRoutes,
  warehouseRoutes,
  financeRoutes,
  productRoutes,
  baseDataRoutes,
  reportRoutes,
  systemRoutes
} = require('./routes')

const app = express()
const PORT = 8080

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/retail', retailRoutes)
app.use('/api/purchase', purchaseRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/warehouse', warehouseRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/product', productRoutes)
app.use('/api/basedata', baseDataRoutes)
app.use('/api/report', reportRoutes)
app.use('/api/system', systemRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AIERP Backend is running' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`AIERP Backend running on http://localhost:${PORT}`)
    console.log('Test login: admin / admin123')
  })
}

startServer()

module.exports = { }
