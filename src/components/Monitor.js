import React from 'react'

class Monitor extends React.Component {
  constructor(props) {
    super(props);
    const reqUrl = new URLSearchParams(this.props.location.search).get("reqTS");
    const nameUrl = new URLSearchParams(this.props.location.search).get("name");
    const statusUrl = new URLSearchParams(this.props.location.search).get("status");
    const devModelUrl = new URLSearchParams(this.props.location.search).get("devModel");
    const devNameUrl = new URLSearchParams(this.props.location.search).get("devName");
    const devOsUrl = new URLSearchParams(this.props.location.search).get("devOS");
    this.state = {
      searchSize: '200',
      searchName: nameUrl || '',
      searchReqTS: reqUrl || '',
      searchStatus: statusUrl || '',
      searchDevModel: devModelUrl || '',
      searchDevName: devNameUrl || '',
      searchDevOS: devOsUrl || '',
      stopped: false,
      dataLogs: []
    }
    this.sendRequestAllLogs(this.state);
  }

  componentDidMount () {
    this.timerID = setInterval(() => this.sendRequestAllLogs(this.state), 5000);
  }

  componentWillUnmount () {
    clearInterval(this.timerID);
  }

  stopTimer = () => {
    //this.setState({stopped: !this.state.stopped});
    // if (this.state.stopped) {
    //   clearInterval(this.timerID);
    // }
    // else {
    //   this.timerID = setInterval(() => this.sendRequestAllLogs(this.state), 5000);
    // };
    clearInterval(this.timerID);
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
    this.sendRequestAllLogs(this.state);
  }

  sendRequestAllLogs = (filter) => {
    let sizeLogs = filter.searchSize;
    let nameLogs = (filter.searchName !== '') ? {"match_phrase": { "name": { "query": filter.searchName }}} : '';
    let reqTS = (filter.searchReqTS !== '') ? {"match_phrase": { "reqTS": { "query": filter.searchReqTS }}} : '';
    let statusLog = (filter.searchStatus !== '') ? {"match_phrase": { "httpRequest.status": { "query": filter.searchStatus }}} : '';
    let devModel = (filter.searchDevModel !== '') ? {"match_phrase": { "httpRequest.dev_model": { "query": filter.searchDevModel }}} : '';
    let devName = (filter.searchDevName !== '') ? {"match_phrase": {"httpRequest.dev_name": {"query": filter.searchDevName}}} : '';
    let devOS = (filter.searchDevOS !== '') ? {"match_phrase": { "httpRequest.dev_os": { "query": filter.searchDevOS }}} : '';

    let queryFilter = [];
    if (nameLogs !== '') queryFilter.push(nameLogs);
    if (reqTS !== '') queryFilter.push(reqTS);
    if (statusLog !== '') queryFilter.push(statusLog);
    if (devModel !== '') queryFilter.push(devModel);
    if (devName !== '') queryFilter.push(devName);
    if (devOS !== '') queryFilter.push(devOS);

    let data = {};
    let dataAll = {
    "version": true, "size": sizeLogs,"sort": [ {"@timestamp": { "order": "desc", "unmapped_type": "boolean"}}], "_source": {"excludes": [] },"query": {"bool": { "must": [  {"match_all": { } },],}},
    };
    let dataFilter = {
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
            queryFilter
          ],
        }
      },
    };
    if (queryFilter.length !== 0) {
      data = dataFilter;
      console.log(queryFilter);
    } else {
      data = dataAll;
    };


    // fetch('https://es-alpha.simplanum.com/_search?sort=@timestamp:desc&q=_type:fluentd' + nameLogs + reqTS + devName +'&size=' + sizeLogs)
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
    if(data !== []) {
      const logs = data.map((elem, i) => {
        return (
          <tr key={elem._id}>
            <td>{elem._source.DT}</td>
            <td>{elem._source.reqTS}</td>
            <td>{elem._source.name}</td>
            <td>{elem._source.httpRequest && elem._source.httpRequest.dev_id || ''}</td>
            <td>{elem._source.httpRequest && elem._source.httpRequest.dev_name || ''}</td>
            <td>{elem._source.httpRequest && elem._source.httpRequest.usr_phone || ''}</td>
            <td>{elem._source.httpRequest && elem._source.httpRequest.remoteIp || ''}</td>
            <td>{elem._source.httpRequest && elem._source.httpRequest.req_geo || ''}</td>
            <td style={{fontSize: "0.68rem"}}>{elem._source.httpRequest && elem._source.httpRequest.requestUrl + ' ' + elem._source.httpRequest.location || ''}</td>
            <td style={{fontSize: "0.68rem"}}>{elem._source.httpRequest && JSON.stringify(elem._source.httpRequest.query) || ''}</td>
            <td style={{fontSize: "0.68rem"}}>{JSON.stringify(elem._source.params)}</td>
            {/* <td style={{ fontSize: "0.55rem" }}>{JSON.stringify(elem._source.log)}</td> */}
          </tr>
        );
      });
      return (
        <tbody style={{fontSize: "0.8rem"}}>{logs}</tbody>
      );
    }
    else {
      return (
        <p>Not data</p>
      );
    }
    
  }

  onSearchChange = (event) => {
    const name = event.target.getAttribute('name');
    this.setState({ [name]: event.target.value });
  }

  render () {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <p><label><span> Number of Logs:  </span>
            <input type="text" name="searchSize" value={this.state.searchSize} onChange={this.onSearchChange} />
          </label>
          <button className='btn' onClick={this.stopTimer}>{this.state.stopped?'Play':'Stop'}</button></p>
          <label> <span>Name: </span>
            <input type="text" name="searchName" value={this.state.searchName} data-type="searchName" onChange={this.onSearchChange} />
          </label>
          <label> <span>reqTS: </span>
            <input type="text" name="searchReqTS" value={this.state.searchReqTS} onChange={this.onSearchChange} />
          </label>
          <label> <span>Status: </span>
            <input type="text" name="searchStatus" value={this.state.searchStatus} onChange={this.onSearchChange} />
          </label>
          <label> <span>Dev_Model: </span>
            <input type="text" name="searchDevModel" value={this.state.searchDevModel} onChange={this.onSearchChange} />
          </label>
          <label> <span>Dev_Name: </span>
            <input type="text" name="searchDevName" value={this.state.searchDevName} onChange={this.onSearchChange} />
          </label>
          <label> <span>Dev_OS: </span>
            <input type="text" name="searchDevOS" value={this.state.searchDevOS} onChange={this.onSearchChange} />
          </label>
          <p><input type="submit" value="Submit" className="btn btn-primary" /></p>
        </form>
        <table className="table table-sm table-striped table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>ReqTS</th>
              <th>Name</th>
              <th>Dev_ID</th>
              <th>Dev_Name</th>
              <th>Phone</th>
              <th>Remote_IP</th>
              <th>Req-geo</th>
              <th>Location</th>
              <th>Query</th>
              <th>Params</th>
              {/* <th>Logs</th> */}
            </tr>
          </thead>
          {this.LogData(this.state.dataLogs)}
        </table>
          
      </div>
    );
  }
}


export default Monitor