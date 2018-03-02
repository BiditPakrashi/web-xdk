/**
 * Simple action handler for the `layer-open-expanded-view` action.  Opens a dialog showing the model that the action is performed against
 *
 * @class Layer.UI.MessageActions.OpenExpandedView
 */

import { register } from './index';
import { logger } from '../../utils';

const openExpandedView = ({ messageViewer, model, data }) => {
  const dialog = document.createElement('layer-message-viewer-expanded');
  dialog.model = model;
  dialog.openActionData = data;
  let node = messageViewer;
  while (node && node.tagName !== 'BODY' && node.tagName !== 'LAYER-CONVERSATION-VIEW') {
    node = node.parentNode;
  }
  if (node.tagName === 'LAYER-CONVERSATION-VIEW') {
    dialog.parentComponent = node;
  }
  if (node.tagName === 'BODY' || node.tagName === 'LAYER-CONVERSATION-VIEW') {
    node.appendChild(dialog);
  } else {
    logger.error('Unable to find a layer-conversation-view or body containing', messageViewer);
  }
};

register('layer-open-expanded-view', openExpandedView);
