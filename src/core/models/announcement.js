
/**
 * The Announcement class represents a type of Message sent by a server.
 *
 * Announcements can not be sent using the WebSDK, only received.
 *
 * You should never need to instantiate an Announcement; they should only be
 * delivered via `messages:add` events when an Announcement is provided via
 * websocket to the client, and `change` events on an Announcements Query.
 *
 * @class  Layer.Core.Announcement
 * @extends Layer.Core.Message.ConversationMessage
 */
import { client as Client } from '../../settings';
import Core from '../namespace';
import ConversationMessage from './conversation-message';
import Syncable from './syncable';
import Root from '../root';
import { ErrorDictionary } from '../layer-error';


class Announcement extends ConversationMessage {

  /**
   * @method send
   * @hide
   */
  send() {}

  /**
   * @method _send
   * @hide
   */
  _send() {}

  /**
   * @method getConversation
   * @hide
   */
  getConversation() {}

  _loaded(data) {
    Client._addMessage(this);
  }

  /**
   * Delete the Announcement from the server.
   *
   * @method delete
   */
  delete() {
    if (this.isDestroyed) throw new Error(ErrorDictionary.isDestroyed);

    const id = this.id;
    this._xhr({
      url: '',
      method: 'DELETE',
    }, (result) => {
      if (!result.success &&
          (!result.data || (result.data.id !== 'not_found' && result.data.id !== 'authentication_required'))) {
        Syncable.load(id);
      }
    });

    this._deleted();
    this.destroy();
  }

  /**
   * Creates an Announcement from the server's representation of an Announcement.
   *
   * Similar to _populateFromServer, however, this method takes a
   * message description and returns a new message instance using _populateFromServer
   * to setup the values.
   *
   * @method _createFromServer
   * @protected
   * @static
   * @param  {Object} message - Server's representation of the announcement
   * @return {Layer.Core.Announcement}
   */
  static _createFromServer(message) {
    const fromWebsocket = message.fromWebsocket;
    return new Announcement({
      fromServer: message,
      _notify: fromWebsocket && message.is_unread,
    });
  }
}

/**
 * @property {String} conversationId
 * @hide
 */

/**
 * @property {Object} deliveryStatus
 * @hide
 */

/**
 * @property {Object} readStatus
 * @hide
 */

/**
 * @property {Object} recipientStatus
 * @hide
 */

/**
 * @method addPart
 * @hide
 */

/**
 * @method send
 * @hide
 */

/**
 * @method isSaved
 * @hide
 */

/**
 * @method isSaving
 * @hide
 */

Announcement.prefixUUID = 'layer:///announcements/';

Announcement._supportedEvents = [].concat(ConversationMessage._supportedEvents);

Announcement.inObjectIgnore = ConversationMessage.inObjectIgnore;

Announcement.mixins = Core.mixins.Announcement;

Root.initClass.apply(Announcement, [Announcement, 'Announcement', Core]);
Syncable.subclasses.push(Announcement);
module.exports = Announcement;
