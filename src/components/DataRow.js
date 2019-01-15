import React from 'react'
import JSONTree from 'react-json-tree'
import Modal from './Modal'

// const _objectWithoutProperties = (obj, keys) => {
//   const target = {};
//   for (const i in obj) {
//     if (keys.indexOf(i) >= 0) continue;
//     if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
//     target[i] = obj[i];
//   }
//   return target;
// };

class DataRow extends React.Component {
  constructor (props) {
    super (props);
    this.state = {
      showModal: false,
    }
  }
  
  viewJSON = () => {
    this.setState({showModal: true});
    document.body.style.overflow = "hidden";
  }

  closeModal = () => {
    this.setState({ showModal: false});
    document.body.style.overflow = "";
  }

  renderModal = () => {
    if (!this.state.showModal) return null;
    let log = this.props.data._source.log;
    try {
      console.log(JSON.parse(log));
      return (
        <Modal onClose={this.closeModal} >
          <JSONTree data={JSON.parse(log)} />
        </Modal>
      )
    } 
    catch(e) {
      alert("Invalid log\n Log: " + log);
      document.body.style.overflow = "";
    }
    
  };
  
  render () {
    const elem = this.props.data;
    return (
      <React.Fragment>
        <tr key={elem._id} onClick={this.viewJSON} id={elem._id} >
          <td align="center">{this.props.index}</td>
          <td>{(elem._source.httpRequest) ? elem._source.DT : 'Not data'}</td>
          <td>{(elem._source.httpRequest) ? elem._source.reqTS : elem._source.req_ts}</td>
          <td>{(elem._source.name) ? elem._source.name : 'Not name'}</td>
          <td>{(elem._source.httpRequest) ? elem._source.httpRequest.dev_id : elem._source.dev_id}</td>
          <td>{(elem._source.httpRequest) ? elem._source.httpRequest.dev_name : elem._source.dev_name}</td>
          <td>{(elem._source.httpRequest) ? elem._source.httpRequest.usr_phone : elem._source.usr_phone}</td>
          <td>{(elem._source.httpRequest) ? elem._source.httpRequest.remoteIp : elem._source.remoteIp}</td>
          <td style={{ fontSize: "0.68rem" }}>{(elem._source.httpRequest) ? (elem._source.httpRequest.requestUrl + ' ' + elem._source.httpRequest.location) : elem._source.request_uri}</td>
          <td style={{ fontSize: "0.68rem" }}>{(elem._source.httpRequest) ? JSON.stringify(elem._source.httpRequest.query) :'Not query'}</td>
        </tr>
        {this.renderModal()}
      </React.Fragment>
  );
  }
}

export default DataRow