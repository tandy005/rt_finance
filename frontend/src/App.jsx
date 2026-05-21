import AppRouter from './routes/index.jsx'

// App.jsx tidak digunakan langsung — routing dihandle di routes/index.jsx
// File ini bisa digunakan untuk global context providers di masa depan
const App = () => <AppRouter />

export default App
