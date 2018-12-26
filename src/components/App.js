import React from 'react'
import { Switch, Route, BrowserRouter, Link } from 'react-router-dom'
import Search from './Search'
import Monitor from './Monitor'


function App() {
  return (
    <BrowserRouter>
      <div className="container-fluid">
        <h1>ElasticSearch App</h1>
        <ul>
          <li><Link to="/search">Search</Link></li>
          <li><Link to="/monitor">Monitor</Link></li>
        </ul>
        <Switch>
          <Route path='/search' component={Search} />
          <Route path='/monitor' component={Monitor} />
        </Switch>
        
      </div>
    </BrowserRouter>
  )
}

export default App