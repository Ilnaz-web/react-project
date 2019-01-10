import React from 'react'
// import ReactJson from 'react-json-view'
// import JSONViewer from 'react-json-viewer'
import JSONTree from 'react-json-tree'
import Modal from './Modal'

const _objectWithoutProperties = (obj, keys) => {
  const target = {};
  for (const i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
};

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
    console.log(JSON.parse(log));
  
    return <Modal onClose={this.closeModal} >
      <JSONTree data={JSON.parse(log)} />
    </Modal>
  };
  
  render () {
    const elem = this.props.data;
    return (
      <React.Fragment>
        <tr key={elem._id} onClick={this.viewJSON} id={elem._id} >
          <td>{elem._source.DT}</td>
          <td>{elem._source.reqTS}</td>
          <td>{elem._source.name}</td>
          <td>{elem._source.httpRequest && elem._source.httpRequest.dev_id || ''}</td>
          <td>{elem._source.httpRequest && elem._source.httpRequest.dev_name || ''}</td>
          <td>{elem._source.httpRequest && elem._source.httpRequest.usr_phone || ''}</td>
          <td>{elem._source.httpRequest && elem._source.httpRequest.remoteIp || ''}</td>
          {/* <td>{elem._source.httpRequest && elem._source.httpRequest.req_geo || ''}</td> */}
          <td style={{ fontSize: "0.68rem" }}>{elem._source.httpRequest && elem._source.httpRequest.requestUrl + ' ' + elem._source.httpRequest.location || ''}</td>
          <td style={{ fontSize: "0.68rem" }}>{elem._source.httpRequest && JSON.stringify(elem._source.httpRequest.query) || ''}</td>
          <td style={{ fontSize: "0.68rem" }}>{JSON.stringify(elem._source.params)}</td>
          {/* <td style={{ fontSize: "0.55rem" }}>{JSON.stringify(elem._source.log)}</td> */}
        </tr>
        {this.renderModal()}
      </React.Fragment>
  );
  }
}

export default DataRow