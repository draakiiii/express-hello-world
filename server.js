const app = require('./app')

const port = process.env.PORT || 3000
const app = express(); // Asegúrate de que esta línea esté presente y correctamente definida

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
