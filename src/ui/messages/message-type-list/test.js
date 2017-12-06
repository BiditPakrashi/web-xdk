describe('Carousel Message Components', function() {
  var CarouselModel, TextModel;
  var conversation;
  var testRoot;

  var styleNode;
  beforeAll(function() {
    styleNode = document.createElement('style');
    styleNode.innerHTML = 'layer-message-viewer.layer-carousel-view  {width: 300px; height: 150px;}';
    document.body.appendChild(styleNode);
  });

  afterAll(function() {
    document.body.removeChild(styleNode);
  });

  beforeEach(function() {
    jasmine.clock().install();
    restoreAnimatedScrollTo = layer.UI.animatedScrollTo;
    spyOn(layer.UI, "animatedScrollTo").and.callFake(function(node, position, duration, callback) {
      var timeoutId = setTimeout(function() {
        node.scrollTop = position;
        if (callback) callback();
      }, duration);
      return function() {
        clearTimeout(timeoutId);
      };
    });

    client = new layer.Core.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Core.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      sessionOwner: true
    });
    client._clientAuthenticated();
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    if (layer.UI.components['layer-conversation-view'] && !layer.UI.components['layer-conversation-view'].classDef) layer.UI.init({});

    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';

    CarouselModel = layer.Core.Client.getMessageTypeModelClass("CarouselModel");
    TextModel = layer.Core.Client.getMessageTypeModelClass("TextModel");

    layer.Util.defer.flush();
    jasmine.clock().tick(800);
    jasmine.clock().uninstall();
  });


  afterEach(function() {
    layer.UI.animatedScrollTo = restoreAnimatedScrollTo;
    layer.Core.Client.removeListenerForNewClient();
  });

  describe("Model Tests", function() {
    it("Should create an appropriate Message with metadata", function() {
      var model = new CarouselModel({
        items: [
          new TextModel({text: "a"}),
          new TextModel({text: "b"}),
          new TextModel({text: "c"}),
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      expect(message.parts.length).toEqual(4);
      expect(message.parts[0].mimeType).toEqual('application/vnd.layer.carousel+json');
      expect(JSON.parse(message.parts[0].body)).toEqual({
      });
      expect(message.parts[1].mimeType).toEqual('application/vnd.layer.text+json');
      expect(message.parts[2].mimeType).toEqual('application/vnd.layer.text+json');
      expect(message.parts[3].mimeType).toEqual('application/vnd.layer.text+json');
      expect(message.parts[1].body).toEqual('{"text":"a"}');
      expect(message.parts[2].body).toEqual('{"text":"b"}');
      expect(message.parts[3].body).toEqual('{"text":"c"}');
    });

    it("Should setup actions correctly", function() {
      var model = new CarouselModel({
        action: {
          event: "fff",
          data: {g: "hhh"}
        },
        items: [
          new TextModel({text: "a"}),
          new TextModel({text: "b", action: {event: "f", data: {m: "n"}}}),
          new TextModel({text: "c", action: {data: {g: "h", i: "j"}}}),
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      expect(model.items[0].actionEvent).toEqual("fff");
      expect(model.items[1].actionEvent).toEqual("f");
      expect(model.items[2].actionEvent).toEqual("fff");

      expect(model.items[0].actionData).toEqual({g: "hhh"});
      expect(model.items[1].actionData).toEqual({g: "hhh", m: "n"});
      expect(model.items[2].actionData).toEqual({g: "h", i: "j"});

      expect(message.parts[1].body).toEqual('{"text":"a"}');
      expect(JSON.parse(message.parts[2].body)).toEqual({text: "b", action: {event: "f", data: {m: "n"}}});
      expect(JSON.parse(message.parts[3].body)).toEqual({text: "c", action: {data: {g: "h", i: "j"}}});
    });



    it("Should instantiate a Model from a Message with metadata", function() {
      var uuid1 = layer.Util.generateUUID();

      var m = conversation.createMessage({
        id: 'layer:///messages/' + uuid1,
        parts: [{
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type: CarouselModel.MIMEType + '; role=root; node-id=a',
          body: JSON.stringify({
            action: {
              event: "fff",
              data: {g: "hhh"}
            },
          })
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type:  "application/vnd.layer.text+json; role=carousel-item; parent-node-id=a",
          body: JSON.stringify({text: "a"})
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type:  "application/vnd.layer.text+json; role=carousel-item; parent-node-id=a",
          body: JSON.stringify({text: "a", action: {event: "f", data: {m: "n"}}})
        }, {
          id: 'layer:///messages/' + uuid1 + '/parts/' + layer.Util.generateUUID(),
          mime_type:  "application/vnd.layer.text+json; role=carousel-item; parent-node-id=a",
          body: JSON.stringify({text: "a", action: {data: {g: "h", i: "j"}}})
        }]
      });
      var model = new CarouselModel({
        message: m,
        part: m.parts[0]
      });

      expect(model.items).toEqual([jasmine.any(TextModel), jasmine.any(TextModel), jasmine.any(TextModel)]);
      expect(model.items[0].action).toEqual({event: "fff", data: {g: "hhh"}});
      expect(model.items[1].action).toEqual({event: "f", data: {g: "hhh", m: "n"}});
      expect(model.items[2].action).toEqual({event: "fff", data: {g: "h", i: "j"} });
    });


    it("Should have a suitable one line summary", function() {
      var model = new CarouselModel({
        items: [
          new TextModel({text: "a"}),
          new TextModel({text: "b"}),
          new TextModel({text: "c"}),
        ]
      });

      expect(model.getOneLineSummary()).toEqual("3 Items");
    });
  });

  describe("View Tests", function() {
    var el, message;
    beforeEach(function() {
      el = document.createElement('layer-message-viewer');
      testRoot.appendChild(el);
    });
    afterEach(function() {
      document.body.removeChild(testRoot);
      layer.Core.Client.removeListenerForNewClient();
      if (el) el.onDestroy();
    });

    it("Should render 3 carousel items", function() {
      var model = new CarouselModel({
        items: [
          new TextModel({text: "a"}),
          new TextModel({text: "b"}),
          new TextModel({text: "c"}),
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();

      // Message Viewer: gets the layer-card-width-chat-bubble class
      expect(el.classList.contains('layer-card-width-flex-width')).toBe(true);

      // Message UI: contains anchor tag
      expect(el.nodes.ui.nodes.items.childNodes[0].model).toBe(model.items[0]);
      expect(el.nodes.ui.nodes.items.childNodes[1].model).toBe(model.items[1]);
      expect(el.nodes.ui.nodes.items.childNodes[2].model).toBe(model.items[2]);
    });

    xit("Should have tests for sizing of cards", function() {

    });

    it("Should have tests for showing/hiding of next/prev buttons", function() {
      var model = new CarouselModel({
        items: [
          new TextModel({text: "a", title: "a"}),
          new TextModel({text: "b", title: "a"}),
          new TextModel({text: "c", title: "a"}),
          new TextModel({text: "d", title: "a"}),
          new TextModel({text: "e", title: "a"}),
        ]
      });
      model.generateMessage(conversation, function(m) {
        message = m;
      });
      jasmine.clock().install();
      el.client = client;
      el.message = message;

      layer.Util.defer.flush();
      jasmine.clock().tick(100);
      jasmine.clock().uninstall();

      expect(el.nodes.ui.classList.contains('layer-carousel-start')).toBe(true);
      expect(el.nodes.ui.classList.contains('layer-carousel-end')).toBe(false);

      el.nodes.ui.nodes.items.scrollLeft = 50;
      el.nodes.ui._updateScrollButtons();

      expect(el.nodes.ui.classList.contains('layer-carousel-start')).toBe(false);
      expect(el.nodes.ui.classList.contains('layer-carousel-end')).toBe(false);

      el.nodes.ui.nodes.items.scrollLeft = el.nodes.ui.nodes.items.scrollWidth - el.nodes.ui.nodes.items.clientWidth - 50;
      el.nodes.ui._updateScrollButtons();

      expect(el.nodes.ui.classList.contains('layer-carousel-start')).toBe(false);
      expect(el.nodes.ui.classList.contains('layer-carousel-end')).toBe(false);

      el.nodes.ui.nodes.items.scrollLeft = el.nodes.ui.nodes.items.scrollWidth - el.nodes.ui.nodes.items.clientWidth;
      el.nodes.ui._updateScrollButtons();

      expect(el.nodes.ui.classList.contains('layer-carousel-start')).toBe(false);
      expect(el.nodes.ui.classList.contains('layer-carousel-end')).toBe(true);
    });

    xit("Should have tests for going to next/prev page of messages", function() {
    });
  });
});