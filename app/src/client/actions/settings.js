import {createAction} from 'redux-actions';

export const setRegion = createAction('setRegion');
export const setSpeed = createAction('setSpeed');
export const setVideoRenderer = createAction('setVideoRenderer');
export const setVideoScale = createAction('setVideoScale');
export const increaseVideoScale = createAction('increaseVideoScale');
export const decreaseVideoScale = createAction('decreaseVideoScale');
export const setVideoPalette = createAction('setVideoPalette');
export const setVideoFilter = createAction('setVideoFilter');
export const setVideoDebug = createAction('setVideoDebug');
export const setFullscreenType = createAction('setFullscreenType');
export const setFpsVisible = createAction('setFpsVisible');
