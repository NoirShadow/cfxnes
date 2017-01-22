import React from 'react';
import logo from '../images/logo.svg';
import Changelog from './Changelog';
import cfxnes from 'cfxnes';

export default class About extends React.Component {

  state = {changelogVisible: false};

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  handleShowChangelog = () => {
    this.setState({changelogVisible: true});
  };

  render() {
    return (
      <main className="about">
        <div className="about-logo">
          <img src={logo} alt="cfxnes logo"/>
        </div>
        <div className="about-text">
          <h1>cfxnes ({cfxnes.version})</h1>
          <p>JavaScript NES emulator and emulation library.</p>
          <p>The source code is available at <a href="https://github.com/jpikl/cfxnes">github</a> and licensed under the MIT License.</p>
          <p>Copyright © 2014-2017 Jan Pikl</p>
          {this.state.changelogVisible
            ? <Changelog/>
            : <a href="javascript:void(0)" onClick={this.handleShowChangelog}>Show change log</a>
          }
        </div>
      </main>
    );
  }

}
