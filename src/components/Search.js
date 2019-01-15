import React from 'react'

class Search extends React.Component {
  constructor(props){
    super(props);
    const reqUrl = new URLSearchParams(this.props.location.search).get("reqTS");
    this.state = {
      searchInput: reqUrl || '',
      data: []
    }
    
    if (this.state.searchInput !== '') this.sendRequest();
  }

  componentWillReceiveProps (nextProps) {
    const reqUrl = new URLSearchParams(this.props.location.search).get("reqTS");
    if (reqUrl !== '' ) {
      this.setState((prevState, props) => ({ searchInput: reqUrl }));
      this.sendRequest();
    } 
  }
  
  onSubmit = (event) => {
    event.preventDefault();
    if (this.state.searchInput !== '') {
      this.props.history.push(`/search?reqTS=${this.state.searchInput}`);

    } else console.log('Not reqTS');
    
  }

  sendRequest = () => {
    let data = {
      "version": true,
      "size": 100,
      "sort": [
        {
          "@timestamp": {
            "order": "desc",
            "unmapped_type": "boolean"
          }
        }
      ],
      "_source": {
        "excludes": [
        ]
      },
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {
              }
            },
            {
              "match_phrase":
              {
                "_index":
                {
                  "query": "default*"
                }
              }
            },
            { 
              "match_phrase": 
              { 
                "reqTS": 
                { 
                  "query": this.state.searchInput 
                } 
              } 
            }
          ],
        }
      },
    };
    fetch('https:///es-alpha.simplanum.com/_search', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log(json.hits.hits);
        let logArr = json.hits.hits;
        this.setState({ data: logArr });
      })
      .catch(alert);
  }

  onSearchChange = (event) => {
    this.setState({searchInput: event.target.value});
  }

  render () {
    //console.log(this.state.searchInput);
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <p><label><span> reqTS:  </span>
              <input type="text" name="searchInput" value={this.state.searchInput || ''} onChange={this.onSearchChange} />
            </label></p>
          <p><input type="submit" value="Submit" className="btn btn-primary" /></p>
        </form>
        <h3>ReqTS: {this.state.searchInput}</h3>
         <ul>
            {this.state.data.map((elem) => {
              return (
                <li key={elem._id}>
                  <h4>ID: {elem._id}</h4>
                  <p>dev_app: {elem._source.httpRequest.dev_app}</p>
                  <p>dev_build: {elem._source.httpRequest.dev_build}</p>
                  <p>dev_id: {elem._source.httpRequest.dev_id}</p>
                  <p>dev_model: {elem._source.httpRequest.dev_model}</p>
                  <p>dev_name: {elem._source.httpRequest.dev_name}</p>
                  <p>dev_os: {elem._source.httpRequest.dev_os}</p>
                  <p>dev_platform: {elem._source.httpRequest.dev_platform}</p>
                  <p>dev_ver: {elem._source.httpRequest.dev_ver}</p>

                  <p>params {JSON.stringify(elem._source.params)}</p>
                </li>
              );
            })}
          </ul>
      </div>
    );
  }
}

export default Search 