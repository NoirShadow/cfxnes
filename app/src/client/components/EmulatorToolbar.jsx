import React from 'react';
import {connect} from 'react-redux';
import ButtonGroup from './ButtonGroup';
import Button from './Button';
import FpsCounter from './FpsCounter';
import {
  resetEmulator, powerEmulator,
  startEmulator, stopEmulator,
  increaseVideoScale, decreaseVideoScale,
  enterFullscreen,
} from '../actions';

class EmulatorToolbar extends React.Component {

  handlePower = () => {
    this.props.dispatch(resetEmulator());
  };

  handleReset = () => {
    this.props.dispatch(powerEmulator());
  };

  handleStart = () => {
    this.props.dispatch(startEmulator());
  };

  handleStop = () => {
    this.props.dispatch(stopEmulator());
  };

  handleIncreaseScale = () => {
    this.props.dispatch(increaseVideoScale());
  };

  handleDecreaseScale = () => {
    this.props.dispatch(decreaseVideoScale());
  };

  handleFullscren = () => {
    this.props.dispatch(enterFullscreen());
  };

  render() {
    const {running, scale, minScale, maxScale} = this.props;

    return (
      <div className="emulator-toolbar">
        <ButtonGroup>
          <Button icon="folder-open" tooltip="Open ROM"/>
        </ButtonGroup>
          <Button icon="power-off" tooltip="Power" onClick={this.handlePower}/>
          <Button icon="repeat" tooltip="Reset" onClick={this.handleReset}/>
          {running
            ? <Button icon="pause" tooltip="Pause" onClick={this.handleStop}/>
            : <Button icon="play" tooltip="Run" onClick={this.handleStart}/>
          }
        <ButtonGroup>
        </ButtonGroup>
        <ButtonGroup>
          <Button icon="search-minus" tooltip="Increase scale" enabled={scale > minScale} onClick={this.handleDecreaseScale}/>
          <Button icon="search-plus" tooltip="Decrease scale" enabled={scale < maxScale} onClick={this.handleIncreaseScale}/>
          <Button icon="arrows-alt" tooltip="Fullscreen" onClick={this.handleFullscren}/>
        </ButtonGroup>
        <ButtonGroup>
          <Button icon="volume-up" tooltip="Volume"/>
        </ButtonGroup>
        {running && <FpsCounter/>}
      </div>
    );
  }

}

const mapStateToProps = state => {
  const {running} = state.emulator;
  const {scale, minScale, maxScale} = state.settings.video;
  return {running, scale, minScale, maxScale};
};

export default connect(mapStateToProps)(EmulatorToolbar);
