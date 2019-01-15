import React from 'react'
import DataRow from './DataRow'

class Monitor extends React.Component {
  constructor(props) {
    super(props);
    const searchUrl = new URLSearchParams(this.props.location.search);
    this.state = {
      searchSize: '200',
      searchName: searchUrl.get("name") || '',
      searchReqTS: searchUrl.get("reqTS") || '',
      searchStatus: searchUrl.get("status") || '',
      searchDevModel: searchUrl.get("devModel") || '',
      searchDevName: searchUrl.get("devName") || '',
      searchDevOS: searchUrl.get("devOS") || '',
      stopped: false,
      dataLogs: []
    }
    this.sendRequestAllLogs();
  }

  componentDidMount () {
    this.timerID = setInterval(() => this.sendRequestAllLogs(), 5000);
  }

  componentWillUnmount () {
    clearInterval(this.timerID);
  }

  stopTimer = () => {
    this.setState({stopped: !this.state.stopped}, () => {
      if (this.state.stopped) {
        clearInterval(this.timerID);
      }
      else {
        this.timerID = setInterval(() => this.sendRequestAllLogs(), 5000);
      };
    });
  }

  onSubmit = (event) => {
    let nameLogs = (this.state.searchName !== '') ? 'name=' + this.state.searchName + '&' : '';
    let reqTS = (this.state.searchReqTS !== '') ? 'reqTS=' + this.state.searchReqTS + '&' : '';
    let statusLog = (this.state.searchStatus !== '') ? 'status=' + this.state.searchStatus + '&' : '';
    let devModel = (this.state.searchDevModel !== '') ? 'devModel=' + this.state.searchDevModel + '&' : '';
    let devName = (this.state.searchDevName !== '') ? 'devName=' + this.state.searchDevName + '&' : '';
    let devOS = (this.state.searchDevOS !== '') ? 'devOS=' + this.state.searchDevOS + '&' : '';
    event.preventDefault();
    this.props.history.push(`/monitor?${nameLogs}${reqTS}${statusLog}${devModel}${devName}${devOS}`);
    this.sendRequestAllLogs();
  }

  sendRequestAllLogs = () => {
    let sizeLogs = this.state.searchSize;
    let queryFilter = [];
    let data;

    if (this.state.searchName !== '') queryFilter.push({ "match_phrase": { "name": { "query": this.state.searchName } } });
    if (this.state.searchReqTS !== '') queryFilter.push({ "match_phrase": { "reqTS": { "query": this.state.searchReqTS } } });
    if (this.state.searchStatus !== '') queryFilter.push({ "match_phrase": { "httpRequest.status": { "query": this.state.searchStatus } } });
    if (this.state.searchDevModel !== '') queryFilter.push({ "match_phrase": { "httpRequest.dev_model": { "query": this.state.searchDevModel } } });
    if (this.state.searchDevName !== '') queryFilter.push({ "match_phrase": { "httpRequest.dev_name": { "query": this.state.searchDevName } } });
    if (this.state.searchDevOS !== '') queryFilter.push({ "match_phrase": { "httpRequest.dev_os": { "query": this.state.searchDevOS } } });

    if (queryFilter.length !== 0) {
      data = {
        "version": true,
        "size": sizeLogs,
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
              queryFilter
            ],
          }
        },
      };
      console.log(queryFilter);
    } 
    else {
      data = {
        "version": true,
        "size": sizeLogs,
        "sort": [
          {
            "@timestamp":
            {
              "order": "desc",
              "unmapped_type": "boolean"
            }
          }
        ],
        "_source":
        {
          "excludes": []
        },
        "query":
        {
          "bool":
          {
            "must": [
              {
                "match_all": {}
              },
              {
                "match_phrase":
                {
                  "_index":
                  {
                    "query": "default*"
                  }
                }
              }
            ],
          }
        },
      };
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
        this.setState({ dataLogs: logArr });
      })
      .catch(alert);
  }

  LogData = (data) => {
    if(data.length !== 0) {
      const logs = data.map((elem, i) => {
          return (
            <DataRow data={elem} index={i} key={elem._id} />
          );
      });
      return (
        <tbody style={{fontSize: "0.8rem"}}>{logs}</tbody>
      );
    }
    else {
      return (
        <tbody>
          <tr>
            <td colSpan="10" align="center">Not data</td>
          </tr>
        </tbody>
      );
    }
    
  }

  FilterLabel = (searchLabel) => {
    let labels = [];
    for(var key in searchLabel) {
      if(key === "dataLogs" || key === "stopped" || key === "searchSize" ) continue;
      labels.push(
        <label key={key}> <span>{key.slice(6)} </span>
          <input type="text" name={key} value={this.state[key]} onChange={this.onSearchChange} />
        </label>
      );
    }
    return labels;
  }

  onSearchChange = (event) => {
    const name = event.target.getAttribute('name');
    this.setState({ [name]: event.target.value });
  }

  render () {
    return (
      <div>
        <button className='btn' onClick={this.stopTimer}>{this.state.stopped ? 'Play' : 'Stop'}</button>
        <form onSubmit={this.onSubmit}>
          <p>
            <label><span> Number of Logs:  </span>
            <input type="text" name="searchSize" value={this.state.searchSize} onChange={this.onSearchChange} />
            </label>
          </p>
          {this.FilterLabel(this.state)}
          <p><input type="submit" value="Submit" className="btn btn-primary" /></p>
        </form>
        
        <table className="table table-sm table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th>Index</th>
              <th>Date</th>
              <th>ReqTS</th>
              <th>Name</th>
              <th>Dev_ID</th>
              <th>Dev_Name</th>
              <th>Phone</th>
              <th>Remote_IP</th>
              <th>Location</th>
              <th>Query</th>
              {/* <th>Params</th> */}
            </tr>
          </thead>
          {this.LogData(this.state.dataLogs)}
        </table>
          
      </div>
    );
  }
}


export default Monitor