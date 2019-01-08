import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

function breakHotKeys(ev) {
  ev.stopPropagation();
  if (ev.keyCode === 13) {
    document.body.addEventListener('keyup', function handler(keyUpEvent) {
      keyUpEvent.stopPropagation();
      document.body.removeEventListener('keyup', handler);
    });
  }
}

class Modal extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    rootEl: PropTypes.string,
    disableHotKeys: PropTypes.bool,
  };
  static defaultProps = {
    rootEl: 'modal',
    disableHotKeys: false,
  };

  constructor(props) {
    super(props);
    const { onClose } = props;
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'modal-content');
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('id', 'modal-overlay');
    this.overlay.addEventListener('click', onClose);
    this.modalRoot = document.getElementById(props.rootEl);

    if (props.disableHotKeys) {
      document.body.addEventListener('keydown', breakHotKeys);
    }
  }

  componentDidMount() {
    this.modalRoot.style.display = 'block';
    this.modalRoot.appendChild(this.overlay);
    this.modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    this.modalRoot.removeChild(this.overlay);
    this.modalRoot.removeChild(this.el);
    if (this.modalRoot.querySelectorAll('#modal-content').length === 0) {
      this.modalRoot.style.display = 'none';
    }

    if (this.props.disableHotKeys) {
      document.body.removeEventListener('keydown', breakHotKeys);
    }
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

export default Modal;
