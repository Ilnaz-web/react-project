import React from 'react'
import { Switch, Route, BrowserRouter, Link } from 'react-router-dom'
import Search from './Search'


function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <h1>ElasticSearch App</h1>
        <ul>
          <li><Link to="/search">Search</Link></li>
        </ul>
        <Switch>
          <Route path='/search' component={Search} />
        </Switch>
        
      </div>
    </BrowserRouter>
  )
}

export default App