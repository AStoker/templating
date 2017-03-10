'use strict';

System.register(['aurelia-logging', 'aurelia-metadata', 'aurelia-pal', 'aurelia-path', 'aurelia-loader', 'aurelia-dependency-injection', 'aurelia-binding', 'aurelia-task-queue'], function (_export, _context) {
  "use strict";

  var LogManager, metadata, Origin, protocol, DOM, PLATFORM, FEATURE, relativeToFile, TemplateRegistryEntry, Loader, inject, Container, resolver, Binding, createOverrideContext, ValueConverterResource, BindingBehaviorResource, subscriberCollection, bindingMode, ObserverLocator, EventManager, TaskQueue, _createClass, _class, _temp, _dec, _class2, _dec2, _class3, _dec3, _class4, _dec4, _class5, _dec5, _class6, _class7, _temp2, _dec6, _class8, _class9, _temp3, _class11, _dec7, _class13, _dec8, _class14, _class15, _temp4, _dec9, _class16, _dec10, _class17, _dec11, _class18, _typeof, animationEvent, Animator, CompositionTransactionNotifier, CompositionTransactionOwnershipToken, CompositionTransaction, capitalMatcher, ViewEngineHooksResource, ElementEvents, ResourceLoadContext, ViewCompileInstruction, BehaviorInstruction, TargetInstruction, viewStrategy, RelativeViewStrategy, ConventionalViewStrategy, NoViewStrategy, TemplateRegistryViewStrategy, InlineViewStrategy, ViewLocator, BindingLanguage, noNodes, SlotCustomAttribute, PassThroughSlot, ShadowSlot, ShadowDOM, ViewResources, View, ViewSlot, ProviderResolver, providerResolverInstance, BoundViewFactory, ViewFactory, nextInjectorId, lastAUTargetID, ViewCompiler, ResourceModule, ResourceDescription, ModuleAnalyzer, logger, ProxyViewFactory, ViewEngine, Controller, BehaviorPropertyObserver, BindableProperty, lastProviderId, HtmlBehaviorResource, ChildObserver, noMutations, ChildObserverBinder, SwapStrategies, CompositionEngine, ElementConfigResource, defaultShadowDOMOptions, TemplatingEngine;

  

  function addHyphenAndLower(char) {
    return '-' + char.toLowerCase();
  }

  function _hyphenate(name) {
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
  }

  _export('_hyphenate', _hyphenate);

  function _isAllWhitespace(node) {
    return !(node.auInterpolationTarget || /[^\t\n\r ]/.test(node.textContent));
  }

  _export('_isAllWhitespace', _isAllWhitespace);

  function viewEngineHooks(target) {
    var deco = function deco(t) {
      metadata.define(metadata.resource, new ViewEngineHooksResource(), t);
    };

    return target ? deco(target) : deco;
  }

  _export('viewEngineHooks', viewEngineHooks);

  function mi(name) {
    throw new Error('BindingLanguage must implement ' + name + '().');
  }

  function register(lookup, name, resource, type) {
    if (!name) {
      return;
    }

    var existing = lookup[name];
    if (existing) {
      if (existing !== resource) {
        throw new Error('Attempted to register ' + type + ' when one with the same name already exists. Name: ' + name + '.');
      }

      return;
    }

    lookup[name] = resource;
  }

  function getAnimatableElement(view) {
    if (view.animatableElement !== undefined) {
      return view.animatableElement;
    }

    var current = view.firstChild;

    while (current && current.nodeType !== 1) {
      current = current.nextSibling;
    }

    if (current && current.nodeType === 1) {
      return view.animatableElement = current.classList.contains('au-animate') ? current : null;
    }

    return view.animatableElement = null;
  }

  function elementContainerGet(key) {
    if (key === DOM.Element) {
      return this.element;
    }

    if (key === BoundViewFactory) {
      if (this.boundViewFactory) {
        return this.boundViewFactory;
      }

      var factory = this.instruction.viewFactory;
      var _partReplacements = this.partReplacements;

      if (_partReplacements) {
        factory = _partReplacements[factory.part] || factory;
      }

      this.boundViewFactory = new BoundViewFactory(this, factory, _partReplacements);
      return this.boundViewFactory;
    }

    if (key === ViewSlot) {
      if (this.viewSlot === undefined) {
        this.viewSlot = new ViewSlot(this.element, this.instruction.anchorIsContainer);
        this.element.isContentProjectionSource = this.instruction.lifting;
        this.children.push(this.viewSlot);
      }

      return this.viewSlot;
    }

    if (key === ElementEvents) {
      return this.elementEvents || (this.elementEvents = new ElementEvents(this.element));
    }

    if (key === CompositionTransaction) {
      return this.compositionTransaction || (this.compositionTransaction = this.parent.get(key));
    }

    if (key === ViewResources) {
      return this.viewResources;
    }

    if (key === TargetInstruction) {
      return this.instruction;
    }

    return this.superGet(key);
  }

  function createElementContainer(parent, element, instruction, children, partReplacements, resources) {
    var container = parent.createChild();
    var providers = void 0;
    var i = void 0;

    container.element = element;
    container.instruction = instruction;
    container.children = children;
    container.viewResources = resources;
    container.partReplacements = partReplacements;

    providers = instruction.providers;
    i = providers.length;

    while (i--) {
      container._resolvers.set(providers[i], providerResolverInstance);
    }

    container.superGet = container.get;
    container.get = elementContainerGet;

    return container;
  }

  function hasAttribute(name) {
    return this._element.hasAttribute(name);
  }

  function getAttribute(name) {
    return this._element.getAttribute(name);
  }

  function setAttribute(name, value) {
    this._element.setAttribute(name, value);
  }

  function makeElementIntoAnchor(element, elementInstruction) {
    var anchor = DOM.createComment('anchor');

    if (elementInstruction) {
      var firstChild = element.firstChild;

      if (firstChild && firstChild.tagName === 'AU-CONTENT') {
        anchor.contentElement = firstChild;
      }

      anchor._element = element;

      anchor.hasAttribute = hasAttribute;
      anchor.getAttribute = getAttribute;
      anchor.setAttribute = setAttribute;
    }

    DOM.replaceNode(anchor, element);

    return anchor;
  }

  function applyInstructions(containers, element, instruction, controllers, bindings, children, shadowSlots, partReplacements, resources) {
    var behaviorInstructions = instruction.behaviorInstructions;
    var expressions = instruction.expressions;
    var elementContainer = void 0;
    var i = void 0;
    var ii = void 0;
    var current = void 0;
    var instance = void 0;

    if (instruction.contentExpression) {
      bindings.push(instruction.contentExpression.createBinding(element.nextSibling));
      element.nextSibling.auInterpolationTarget = true;
      element.parentNode.removeChild(element);
      return;
    }

    if (instruction.shadowSlot) {
      var commentAnchor = DOM.createComment('slot');
      var slot = void 0;

      if (instruction.slotDestination) {
        slot = new PassThroughSlot(commentAnchor, instruction.slotName, instruction.slotDestination, instruction.slotFallbackFactory);
      } else {
        slot = new ShadowSlot(commentAnchor, instruction.slotName, instruction.slotFallbackFactory);
      }

      DOM.replaceNode(commentAnchor, element);
      shadowSlots[instruction.slotName] = slot;
      controllers.push(slot);
      return;
    }

    if (behaviorInstructions.length) {
      if (!instruction.anchorIsContainer) {
        element = makeElementIntoAnchor(element, instruction.elementInstruction);
      }

      containers[instruction.injectorId] = elementContainer = createElementContainer(containers[instruction.parentInjectorId], element, instruction, children, partReplacements, resources);

      for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
        current = behaviorInstructions[i];
        instance = current.type.create(elementContainer, current, element, bindings);
        controllers.push(instance);
      }
    }

    for (i = 0, ii = expressions.length; i < ii; ++i) {
      bindings.push(expressions[i].createBinding(element));
    }
  }

  function styleStringToObject(style, target) {
    var attributes = style.split(';');
    var firstIndexOfColon = void 0;
    var i = void 0;
    var current = void 0;
    var key = void 0;
    var value = void 0;

    target = target || {};

    for (i = 0; i < attributes.length; i++) {
      current = attributes[i];
      firstIndexOfColon = current.indexOf(':');
      key = current.substring(0, firstIndexOfColon).trim();
      value = current.substring(firstIndexOfColon + 1).trim();
      target[key] = value;
    }

    return target;
  }

  function styleObjectToString(obj) {
    var result = '';

    for (var key in obj) {
      result += key + ':' + obj[key] + ';';
    }

    return result;
  }

  function applySurrogateInstruction(container, element, instruction, controllers, bindings, children) {
    var behaviorInstructions = instruction.behaviorInstructions;
    var expressions = instruction.expressions;
    var providers = instruction.providers;
    var values = instruction.values;
    var i = void 0;
    var ii = void 0;
    var current = void 0;
    var instance = void 0;
    var currentAttributeValue = void 0;

    i = providers.length;
    while (i--) {
      container._resolvers.set(providers[i], providerResolverInstance);
    }

    for (var key in values) {
      currentAttributeValue = element.getAttribute(key);

      if (currentAttributeValue) {
        if (key === 'class') {
          element.setAttribute('class', currentAttributeValue + ' ' + values[key]);
        } else if (key === 'style') {
          var styleObject = styleStringToObject(values[key]);
          styleStringToObject(currentAttributeValue, styleObject);
          element.setAttribute('style', styleObjectToString(styleObject));
        }
      } else {
        element.setAttribute(key, values[key]);
      }
    }

    if (behaviorInstructions.length) {
      for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
        current = behaviorInstructions[i];
        instance = current.type.create(container, current, element, bindings);

        if (instance.contentView) {
          children.push(instance.contentView);
        }

        controllers.push(instance);
      }
    }

    for (i = 0, ii = expressions.length; i < ii; ++i) {
      bindings.push(expressions[i].createBinding(element));
    }
  }

  function getNextInjectorId() {
    return ++nextInjectorId;
  }

  function getNextAUTargetID() {
    return (++lastAUTargetID).toString();
  }

  function makeIntoInstructionTarget(element) {
    var value = element.getAttribute('class');
    var auTargetID = getNextAUTargetID();

    element.setAttribute('class', value ? value + ' au-target' : 'au-target');
    element.setAttribute('au-target-id', auTargetID);

    return auTargetID;
  }

  function makeShadowSlot(compiler, resources, node, instructions, parentInjectorId) {
    var auShadowSlot = DOM.createElement('au-shadow-slot');
    DOM.replaceNode(auShadowSlot, node);

    var auTargetID = makeIntoInstructionTarget(auShadowSlot);
    var instruction = TargetInstruction.shadowSlot(parentInjectorId);

    instruction.slotName = node.getAttribute('name') || ShadowDOM.defaultSlotKey;
    instruction.slotDestination = node.getAttribute('slot');

    if (node.innerHTML.trim()) {
      var fragment = DOM.createDocumentFragment();
      var _child4 = void 0;

      while (_child4 = node.firstChild) {
        fragment.appendChild(_child4);
      }

      instruction.slotFallbackFactory = compiler.compile(fragment, resources);
    }

    instructions[auTargetID] = instruction;

    return auShadowSlot;
  }

  function ensureRegistryEntry(loader, urlOrRegistryEntry) {
    if (urlOrRegistryEntry instanceof TemplateRegistryEntry) {
      return Promise.resolve(urlOrRegistryEntry);
    }

    return loader.loadTemplate(urlOrRegistryEntry);
  }

  function getObserver(behavior, instance, name) {
    var lookup = instance.__observers__;

    if (lookup === undefined) {
      if (!behavior.isInitialized) {
        behavior.initialize(Container.instance || new Container(), instance.constructor);
      }

      lookup = behavior.observerLocator.getOrCreateObserversLookup(instance);
      behavior._ensurePropertiesDefined(instance, lookup);
    }

    return lookup[name];
  }

  function nextProviderId() {
    return ++lastProviderId;
  }

  function doProcessContent() {
    return true;
  }
  function doProcessAttributes() {}

  function createChildObserverDecorator(selectorOrConfig, all) {
    return function (target, key, descriptor) {
      var actualTarget = typeof key === 'string' ? target.constructor : target;
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, actualTarget);

      if (typeof selectorOrConfig === 'string') {
        selectorOrConfig = {
          selector: selectorOrConfig,
          name: key
        };
      }

      if (descriptor) {
        descriptor.writable = true;
        descriptor.configurable = true;
      }

      selectorOrConfig.all = all;
      r.addChildBinding(new ChildObserver(selectorOrConfig));
    };
  }

  function children(selectorOrConfig) {
    return createChildObserverDecorator(selectorOrConfig, true);
  }

  _export('children', children);

  function child(selectorOrConfig) {
    return createChildObserverDecorator(selectorOrConfig, false);
  }

  _export('child', child);

  function trackMutation(groupedMutations, binder, record) {
    var mutations = groupedMutations.get(binder);

    if (!mutations) {
      mutations = [];
      groupedMutations.set(binder, mutations);
    }

    mutations.push(record);
  }

  function onChildChange(mutations, observer) {
    var binders = observer.binders;
    var bindersLength = binders.length;
    var groupedMutations = new Map();

    for (var _i8 = 0, _ii8 = mutations.length; _i8 < _ii8; ++_i8) {
      var record = mutations[_i8];
      var added = record.addedNodes;
      var removed = record.removedNodes;

      for (var j = 0, jj = removed.length; j < jj; ++j) {
        var node = removed[j];
        if (node.nodeType === 1) {
          for (var k = 0; k < bindersLength; ++k) {
            var binder = binders[k];
            if (binder.onRemove(node)) {
              trackMutation(groupedMutations, binder, record);
            }
          }
        }
      }

      for (var _j = 0, _jj = added.length; _j < _jj; ++_j) {
        var _node = added[_j];
        if (_node.nodeType === 1) {
          for (var _k = 0; _k < bindersLength; ++_k) {
            var _binder = binders[_k];
            if (_binder.onAdd(_node)) {
              trackMutation(groupedMutations, _binder, record);
            }
          }
        }
      }
    }

    groupedMutations.forEach(function (value, key) {
      if (key.changeHandler !== null) {
        key.viewModel[key.changeHandler](value);
      }
    });
  }

  function remove(viewSlot, previous) {
    return Array.isArray(previous) ? viewSlot.removeMany(previous, true) : viewSlot.remove(previous, true);
  }

  function tryActivateViewModel(context) {
    if (context.skipActivation || typeof context.viewModel.activate !== 'function') {
      return Promise.resolve();
    }

    return context.viewModel.activate(context.model) || Promise.resolve();
  }

  function validateBehaviorName(name, type) {
    if (/[A-Z]/.test(name)) {
      var newName = _hyphenate(name);
      LogManager.getLogger('templating').warn('\'' + name + '\' is not a valid ' + type + ' name and has been converted to \'' + newName + '\'. Upper-case letters are not allowed because the DOM is not case-sensitive.');
      return newName;
    }
    return name;
  }

  function resource(instance) {
    return function (target) {
      metadata.define(metadata.resource, instance, target);
    };
  }

  _export('resource', resource);

  function behavior(override) {
    return function (target) {
      if (override instanceof HtmlBehaviorResource) {
        metadata.define(metadata.resource, override, target);
      } else {
        var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
        Object.assign(r, override);
      }
    };
  }

  _export('behavior', behavior);

  function customElement(name) {
    return function (target) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
      r.elementName = validateBehaviorName(name, 'custom element');
    };
  }

  _export('customElement', customElement);

  function customAttribute(name, defaultBindingMode) {
    return function (target) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
      r.attributeName = validateBehaviorName(name, 'custom attribute');
      r.attributeDefaultBindingMode = defaultBindingMode;
    };
  }

  _export('customAttribute', customAttribute);

  function alias(name) {
    return function (target) {
      var existing = metadata.get(metadata.resource, target);
      if (!existing) {
        throw Error('No behavior to alias');
      }
      existing.aliases.push(name);
    };
  }

  _export('alias', alias);

  function templateController(target) {
    var deco = function deco(t) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
      r.liftsContent = true;
    };

    return target ? deco(target) : deco;
  }

  _export('templateController', templateController);

  function bindable(nameOrConfigOrTarget, key, descriptor) {
    var deco = function deco(target, key2, descriptor2) {
      var actualTarget = key2 ? target.constructor : target;
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, actualTarget);
      var prop = void 0;

      if (key2) {
        nameOrConfigOrTarget = nameOrConfigOrTarget || {};
        nameOrConfigOrTarget.name = key2;
      }

      prop = new BindableProperty(nameOrConfigOrTarget);
      return prop.registerWith(actualTarget, r, descriptor2);
    };

    if (!nameOrConfigOrTarget) {
      return deco;
    }

    if (key) {
      var _target = nameOrConfigOrTarget;
      nameOrConfigOrTarget = null;
      return deco(_target, key, descriptor);
    }

    return deco;
  }

  _export('bindable', bindable);

  function dynamicOptions(target) {
    var deco = function deco(t) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
      r.hasDynamicOptions = true;
    };

    return target ? deco(target) : deco;
  }

  _export('dynamicOptions', dynamicOptions);

  function useShadowDOM(targetOrOptions) {
    var options = typeof targetOrOptions === 'function' || !targetOrOptions ? defaultShadowDOMOptions : targetOrOptions;

    var deco = function deco(t) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
      r.targetShadowDOM = true;
      r.shadowDOMOptions = options;
    };

    return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
  }

  _export('useShadowDOM', useShadowDOM);

  function processAttributes(processor) {
    return function (t) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
      r.processAttributes = function (compiler, resources, node, attributes, elementInstruction) {
        try {
          processor(compiler, resources, node, attributes, elementInstruction);
        } catch (error) {
          LogManager.getLogger('templating').error(error);
        }
      };
    };
  }

  _export('processAttributes', processAttributes);

  function doNotProcessContent() {
    return false;
  }

  function processContent(processor) {
    return function (t) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
      r.processContent = processor ? function (compiler, resources, node, instruction) {
        try {
          return processor(compiler, resources, node, instruction);
        } catch (error) {
          LogManager.getLogger('templating').error(error);
          return false;
        }
      } : doNotProcessContent;
    };
  }

  _export('processContent', processContent);

  function containerless(target) {
    var deco = function deco(t) {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
      r.containerless = true;
    };

    return target ? deco(target) : deco;
  }

  _export('containerless', containerless);

  function useViewStrategy(strategy) {
    return function (target) {
      metadata.define(ViewLocator.viewStrategyMetadataKey, strategy, target);
    };
  }

  _export('useViewStrategy', useViewStrategy);

  function useView(path) {
    return useViewStrategy(new RelativeViewStrategy(path));
  }

  _export('useView', useView);

  function inlineView(markup, dependencies, dependencyBaseUrl) {
    return useViewStrategy(new InlineViewStrategy(markup, dependencies, dependencyBaseUrl));
  }

  _export('inlineView', inlineView);

  function noView(targetOrDependencies, dependencyBaseUrl) {
    var target = void 0;
    var dependencies = void 0;
    if (typeof targetOrDependencies === 'function') {
      target = targetOrDependencies;
    } else {
      dependencies = targetOrDependencies;
      target = undefined;
    }

    var deco = function deco(t) {
      metadata.define(ViewLocator.viewStrategyMetadataKey, new NoViewStrategy(dependencies, dependencyBaseUrl), t);
    };

    return target ? deco(target) : deco;
  }

  _export('noView', noView);

  function elementConfig(target) {
    var deco = function deco(t) {
      metadata.define(metadata.resource, new ElementConfigResource(), t);
    };

    return target ? deco(target) : deco;
  }

  _export('elementConfig', elementConfig);

  function viewResources() {
    for (var _len = arguments.length, resources = Array(_len), _key = 0; _key < _len; _key++) {
      resources[_key] = arguments[_key];
    }

    return function (target) {
      metadata.define(ViewEngine.viewModelRequireMetadataKey, resources, target);
    };
  }

  _export('viewResources', viewResources);

  return {
    setters: [function (_aureliaLogging) {
      LogManager = _aureliaLogging;
    }, function (_aureliaMetadata) {
      metadata = _aureliaMetadata.metadata;
      Origin = _aureliaMetadata.Origin;
      protocol = _aureliaMetadata.protocol;
    }, function (_aureliaPal) {
      DOM = _aureliaPal.DOM;
      PLATFORM = _aureliaPal.PLATFORM;
      FEATURE = _aureliaPal.FEATURE;
    }, function (_aureliaPath) {
      relativeToFile = _aureliaPath.relativeToFile;
    }, function (_aureliaLoader) {
      TemplateRegistryEntry = _aureliaLoader.TemplateRegistryEntry;
      Loader = _aureliaLoader.Loader;
    }, function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
      Container = _aureliaDependencyInjection.Container;
      resolver = _aureliaDependencyInjection.resolver;
    }, function (_aureliaBinding) {
      Binding = _aureliaBinding.Binding;
      createOverrideContext = _aureliaBinding.createOverrideContext;
      ValueConverterResource = _aureliaBinding.ValueConverterResource;
      BindingBehaviorResource = _aureliaBinding.BindingBehaviorResource;
      subscriberCollection = _aureliaBinding.subscriberCollection;
      bindingMode = _aureliaBinding.bindingMode;
      ObserverLocator = _aureliaBinding.ObserverLocator;
      EventManager = _aureliaBinding.EventManager;
    }, function (_aureliaTaskQueue) {
      TaskQueue = _aureliaTaskQueue.TaskQueue;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

      _export('animationEvent', animationEvent = {
        enterBegin: 'animation:enter:begin',
        enterActive: 'animation:enter:active',
        enterDone: 'animation:enter:done',
        enterTimeout: 'animation:enter:timeout',

        leaveBegin: 'animation:leave:begin',
        leaveActive: 'animation:leave:active',
        leaveDone: 'animation:leave:done',
        leaveTimeout: 'animation:leave:timeout',

        staggerNext: 'animation:stagger:next',

        removeClassBegin: 'animation:remove-class:begin',
        removeClassActive: 'animation:remove-class:active',
        removeClassDone: 'animation:remove-class:done',
        removeClassTimeout: 'animation:remove-class:timeout',

        addClassBegin: 'animation:add-class:begin',
        addClassActive: 'animation:add-class:active',
        addClassDone: 'animation:add-class:done',
        addClassTimeout: 'animation:add-class:timeout',

        animateBegin: 'animation:animate:begin',
        animateActive: 'animation:animate:active',
        animateDone: 'animation:animate:done',
        animateTimeout: 'animation:animate:timeout',

        sequenceBegin: 'animation:sequence:begin',
        sequenceDone: 'animation:sequence:done'
      });

      _export('animationEvent', animationEvent);

      _export('Animator', Animator = function () {
        function Animator() {
          
        }

        Animator.prototype.enter = function enter(element) {
          return Promise.resolve(false);
        };

        Animator.prototype.leave = function leave(element) {
          return Promise.resolve(false);
        };

        Animator.prototype.removeClass = function removeClass(element, className) {
          element.classList.remove(className);
          return Promise.resolve(false);
        };

        Animator.prototype.addClass = function addClass(element, className) {
          element.classList.add(className);
          return Promise.resolve(false);
        };

        Animator.prototype.animate = function animate(element, className) {
          return Promise.resolve(false);
        };

        Animator.prototype.runSequence = function runSequence(animations) {};

        Animator.prototype.registerEffect = function registerEffect(effectName, properties) {};

        Animator.prototype.unregisterEffect = function unregisterEffect(effectName) {};

        return Animator;
      }());

      _export('Animator', Animator);

      _export('CompositionTransactionNotifier', CompositionTransactionNotifier = function () {
        function CompositionTransactionNotifier(owner) {
          

          this.owner = owner;
          this.owner._compositionCount++;
        }

        CompositionTransactionNotifier.prototype.done = function done() {
          this.owner._compositionCount--;
          this.owner._tryCompleteTransaction();
        };

        return CompositionTransactionNotifier;
      }());

      _export('CompositionTransactionNotifier', CompositionTransactionNotifier);

      _export('CompositionTransactionOwnershipToken', CompositionTransactionOwnershipToken = function () {
        function CompositionTransactionOwnershipToken(owner) {
          

          this.owner = owner;
          this.owner._ownershipToken = this;
          this.thenable = this._createThenable();
        }

        CompositionTransactionOwnershipToken.prototype.waitForCompositionComplete = function waitForCompositionComplete() {
          this.owner._tryCompleteTransaction();
          return this.thenable;
        };

        CompositionTransactionOwnershipToken.prototype.resolve = function resolve() {
          this._resolveCallback();
        };

        CompositionTransactionOwnershipToken.prototype._createThenable = function _createThenable() {
          var _this = this;

          return new Promise(function (resolve, reject) {
            _this._resolveCallback = resolve;
          });
        };

        return CompositionTransactionOwnershipToken;
      }());

      _export('CompositionTransactionOwnershipToken', CompositionTransactionOwnershipToken);

      _export('CompositionTransaction', CompositionTransaction = function () {
        function CompositionTransaction() {
          

          this._ownershipToken = null;
          this._compositionCount = 0;
        }

        CompositionTransaction.prototype.tryCapture = function tryCapture() {
          return this._ownershipToken === null ? new CompositionTransactionOwnershipToken(this) : null;
        };

        CompositionTransaction.prototype.enlist = function enlist() {
          return new CompositionTransactionNotifier(this);
        };

        CompositionTransaction.prototype._tryCompleteTransaction = function _tryCompleteTransaction() {
          if (this._compositionCount <= 0) {
            this._compositionCount = 0;

            if (this._ownershipToken !== null) {
              var token = this._ownershipToken;
              this._ownershipToken = null;
              token.resolve();
            }
          }
        };

        return CompositionTransaction;
      }());

      _export('CompositionTransaction', CompositionTransaction);

      capitalMatcher = /([A-Z])/g;

      _export('ViewEngineHooksResource', ViewEngineHooksResource = function () {
        function ViewEngineHooksResource() {
          
        }

        ViewEngineHooksResource.prototype.initialize = function initialize(container, target) {
          this.instance = container.get(target);
        };

        ViewEngineHooksResource.prototype.register = function register(registry, name) {
          registry.registerViewEngineHooks(this.instance);
        };

        ViewEngineHooksResource.prototype.load = function load(container, target) {};

        ViewEngineHooksResource.convention = function convention(name) {
          if (name.endsWith('ViewEngineHooks')) {
            return new ViewEngineHooksResource();
          }
        };

        return ViewEngineHooksResource;
      }());

      _export('ViewEngineHooksResource', ViewEngineHooksResource);

      _export('ElementEvents', ElementEvents = function () {
        function ElementEvents(element) {
          

          this.element = element;
          this.subscriptions = {};
        }

        ElementEvents.prototype._enqueueHandler = function _enqueueHandler(handler) {
          this.subscriptions[handler.eventName] = this.subscriptions[handler.eventName] || [];
          this.subscriptions[handler.eventName].push(handler);
        };

        ElementEvents.prototype._dequeueHandler = function _dequeueHandler(handler) {
          var index = void 0;
          var subscriptions = this.subscriptions[handler.eventName];
          if (subscriptions) {
            index = subscriptions.indexOf(handler);
            if (index > -1) {
              subscriptions.splice(index, 1);
            }
          }
          return handler;
        };

        ElementEvents.prototype.publish = function publish(eventName) {
          var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var bubbles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
          var cancelable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

          var event = DOM.createCustomEvent(eventName, { cancelable: cancelable, bubbles: bubbles, detail: detail });
          this.element.dispatchEvent(event);
        };

        ElementEvents.prototype.subscribe = function subscribe(eventName, handler) {
          var _this2 = this;

          var bubbles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

          if (handler && typeof handler === 'function') {
            handler.eventName = eventName;
            handler.handler = handler;
            handler.bubbles = bubbles;
            handler.dispose = function () {
              _this2.element.removeEventListener(eventName, handler, bubbles);
              _this2._dequeueHandler(handler);
            };
            this.element.addEventListener(eventName, handler, bubbles);
            this._enqueueHandler(handler);
            return handler;
          }

          return undefined;
        };

        ElementEvents.prototype.subscribeOnce = function subscribeOnce(eventName, handler) {
          var _this3 = this;

          var bubbles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

          if (handler && typeof handler === 'function') {
            var _ret = function () {
              var _handler = function _handler(event) {
                handler(event);
                _handler.dispose();
              };
              return {
                v: _this3.subscribe(eventName, _handler, bubbles)
              };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
          }

          return undefined;
        };

        ElementEvents.prototype.dispose = function dispose(eventName) {
          if (eventName && typeof eventName === 'string') {
            var subscriptions = this.subscriptions[eventName];
            if (subscriptions) {
              while (subscriptions.length) {
                var subscription = subscriptions.pop();
                if (subscription) {
                  subscription.dispose();
                }
              }
            }
          } else {
            this.disposeAll();
          }
        };

        ElementEvents.prototype.disposeAll = function disposeAll() {
          for (var key in this.subscriptions) {
            this.dispose(key);
          }
        };

        return ElementEvents;
      }());

      _export('ElementEvents', ElementEvents);

      _export('ResourceLoadContext', ResourceLoadContext = function () {
        function ResourceLoadContext() {
          

          this.dependencies = {};
        }

        ResourceLoadContext.prototype.addDependency = function addDependency(url) {
          this.dependencies[url] = true;
        };

        ResourceLoadContext.prototype.hasDependency = function hasDependency(url) {
          return url in this.dependencies;
        };

        return ResourceLoadContext;
      }());

      _export('ResourceLoadContext', ResourceLoadContext);

      _export('ViewCompileInstruction', ViewCompileInstruction = function ViewCompileInstruction() {
        var targetShadowDOM = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var compileSurrogate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        

        this.targetShadowDOM = targetShadowDOM;
        this.compileSurrogate = compileSurrogate;
        this.associatedModuleId = null;
      });

      _export('ViewCompileInstruction', ViewCompileInstruction);

      ViewCompileInstruction.normal = new ViewCompileInstruction();

      _export('BehaviorInstruction', BehaviorInstruction = function () {
        BehaviorInstruction.enhance = function enhance() {
          var instruction = new BehaviorInstruction();
          instruction.enhance = true;
          return instruction;
        };

        BehaviorInstruction.unitTest = function unitTest(type, attributes) {
          var instruction = new BehaviorInstruction();
          instruction.type = type;
          instruction.attributes = attributes || {};
          return instruction;
        };

        BehaviorInstruction.element = function element(node, type) {
          var instruction = new BehaviorInstruction();
          instruction.type = type;
          instruction.attributes = {};
          instruction.anchorIsContainer = !(node.hasAttribute('containerless') || type.containerless);
          instruction.initiatedByBehavior = true;
          return instruction;
        };

        BehaviorInstruction.attribute = function attribute(attrName, type) {
          var instruction = new BehaviorInstruction();
          instruction.attrName = attrName;
          instruction.type = type || null;
          instruction.attributes = {};
          return instruction;
        };

        BehaviorInstruction.dynamic = function dynamic(host, viewModel, viewFactory) {
          var instruction = new BehaviorInstruction();
          instruction.host = host;
          instruction.viewModel = viewModel;
          instruction.viewFactory = viewFactory;
          instruction.inheritBindingContext = true;
          return instruction;
        };

        function BehaviorInstruction() {
          

          this.initiatedByBehavior = false;
          this.enhance = false;
          this.partReplacements = null;
          this.viewFactory = null;
          this.originalAttrName = null;
          this.skipContentProcessing = false;
          this.contentFactory = null;
          this.viewModel = null;
          this.anchorIsContainer = false;
          this.host = null;
          this.attributes = null;
          this.type = null;
          this.attrName = null;
          this.inheritBindingContext = false;
        }

        return BehaviorInstruction;
      }());

      _export('BehaviorInstruction', BehaviorInstruction);

      BehaviorInstruction.normal = new BehaviorInstruction();

      _export('TargetInstruction', TargetInstruction = (_temp = _class = function () {
        TargetInstruction.shadowSlot = function shadowSlot(parentInjectorId) {
          var instruction = new TargetInstruction();
          instruction.parentInjectorId = parentInjectorId;
          instruction.shadowSlot = true;
          return instruction;
        };

        TargetInstruction.contentExpression = function contentExpression(expression) {
          var instruction = new TargetInstruction();
          instruction.contentExpression = expression;
          return instruction;
        };

        TargetInstruction.lifting = function lifting(parentInjectorId, liftingInstruction) {
          var instruction = new TargetInstruction();
          instruction.parentInjectorId = parentInjectorId;
          instruction.expressions = TargetInstruction.noExpressions;
          instruction.behaviorInstructions = [liftingInstruction];
          instruction.viewFactory = liftingInstruction.viewFactory;
          instruction.providers = [liftingInstruction.type.target];
          instruction.lifting = true;
          return instruction;
        };

        TargetInstruction.normal = function normal(injectorId, parentInjectorId, providers, behaviorInstructions, expressions, elementInstruction) {
          var instruction = new TargetInstruction();
          instruction.injectorId = injectorId;
          instruction.parentInjectorId = parentInjectorId;
          instruction.providers = providers;
          instruction.behaviorInstructions = behaviorInstructions;
          instruction.expressions = expressions;
          instruction.anchorIsContainer = elementInstruction ? elementInstruction.anchorIsContainer : true;
          instruction.elementInstruction = elementInstruction;
          return instruction;
        };

        TargetInstruction.surrogate = function surrogate(providers, behaviorInstructions, expressions, values) {
          var instruction = new TargetInstruction();
          instruction.expressions = expressions;
          instruction.behaviorInstructions = behaviorInstructions;
          instruction.providers = providers;
          instruction.values = values;
          return instruction;
        };

        function TargetInstruction() {
          

          this.injectorId = null;
          this.parentInjectorId = null;

          this.shadowSlot = false;
          this.slotName = null;
          this.slotFallbackFactory = null;

          this.contentExpression = null;

          this.expressions = null;
          this.behaviorInstructions = null;
          this.providers = null;

          this.viewFactory = null;

          this.anchorIsContainer = false;
          this.elementInstruction = null;
          this.lifting = false;

          this.values = null;
        }

        return TargetInstruction;
      }(), _class.noExpressions = Object.freeze([]), _temp));

      _export('TargetInstruction', TargetInstruction);

      _export('viewStrategy', viewStrategy = protocol.create('aurelia:view-strategy', {
        validate: function validate(target) {
          if (!(typeof target.loadViewFactory === 'function')) {
            return 'View strategies must implement: loadViewFactory(viewEngine: ViewEngine, compileInstruction: ViewCompileInstruction, loadContext?: ResourceLoadContext): Promise<ViewFactory>';
          }

          return true;
        },
        compose: function compose(target) {
          if (!(typeof target.makeRelativeTo === 'function')) {
            target.makeRelativeTo = PLATFORM.noop;
          }
        }
      }));

      _export('viewStrategy', viewStrategy);

      _export('RelativeViewStrategy', RelativeViewStrategy = (_dec = viewStrategy(), _dec(_class2 = function () {
        function RelativeViewStrategy(path) {
          

          this.path = path;
          this.absolutePath = null;
        }

        RelativeViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
          if (this.absolutePath === null && this.moduleId) {
            this.absolutePath = relativeToFile(this.path, this.moduleId);
          }

          compileInstruction.associatedModuleId = this.moduleId;
          return viewEngine.loadViewFactory(this.absolutePath || this.path, compileInstruction, loadContext, target);
        };

        RelativeViewStrategy.prototype.makeRelativeTo = function makeRelativeTo(file) {
          if (this.absolutePath === null) {
            this.absolutePath = relativeToFile(this.path, file);
          }
        };

        return RelativeViewStrategy;
      }()) || _class2));

      _export('RelativeViewStrategy', RelativeViewStrategy);

      _export('ConventionalViewStrategy', ConventionalViewStrategy = (_dec2 = viewStrategy(), _dec2(_class3 = function () {
        function ConventionalViewStrategy(viewLocator, origin) {
          

          this.moduleId = origin.moduleId;
          this.viewUrl = viewLocator.convertOriginToViewUrl(origin);
        }

        ConventionalViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
          compileInstruction.associatedModuleId = this.moduleId;
          return viewEngine.loadViewFactory(this.viewUrl, compileInstruction, loadContext, target);
        };

        return ConventionalViewStrategy;
      }()) || _class3));

      _export('ConventionalViewStrategy', ConventionalViewStrategy);

      _export('NoViewStrategy', NoViewStrategy = (_dec3 = viewStrategy(), _dec3(_class4 = function () {
        function NoViewStrategy(dependencies, dependencyBaseUrl) {
          

          this.dependencies = dependencies || null;
          this.dependencyBaseUrl = dependencyBaseUrl || '';
        }

        NoViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
          var entry = this.entry;
          var dependencies = this.dependencies;

          if (entry && entry.factoryIsReady) {
            return Promise.resolve(null);
          }

          this.entry = entry = new TemplateRegistryEntry(this.moduleId || this.dependencyBaseUrl);

          entry.dependencies = [];
          entry.templateIsLoaded = true;

          if (dependencies !== null) {
            for (var i = 0, ii = dependencies.length; i < ii; ++i) {
              var current = dependencies[i];

              if (typeof current === 'string' || typeof current === 'function') {
                entry.addDependency(current);
              } else {
                entry.addDependency(current.from, current.as);
              }
            }
          }

          compileInstruction.associatedModuleId = this.moduleId;

          return viewEngine.loadViewFactory(entry, compileInstruction, loadContext, target);
        };

        return NoViewStrategy;
      }()) || _class4));

      _export('NoViewStrategy', NoViewStrategy);

      _export('TemplateRegistryViewStrategy', TemplateRegistryViewStrategy = (_dec4 = viewStrategy(), _dec4(_class5 = function () {
        function TemplateRegistryViewStrategy(moduleId, entry) {
          

          this.moduleId = moduleId;
          this.entry = entry;
        }

        TemplateRegistryViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
          var entry = this.entry;

          if (entry.factoryIsReady) {
            return Promise.resolve(entry.factory);
          }

          compileInstruction.associatedModuleId = this.moduleId;
          return viewEngine.loadViewFactory(entry, compileInstruction, loadContext, target);
        };

        return TemplateRegistryViewStrategy;
      }()) || _class5));

      _export('TemplateRegistryViewStrategy', TemplateRegistryViewStrategy);

      _export('InlineViewStrategy', InlineViewStrategy = (_dec5 = viewStrategy(), _dec5(_class6 = function () {
        function InlineViewStrategy(markup, dependencies, dependencyBaseUrl) {
          

          this.markup = markup;
          this.dependencies = dependencies || null;
          this.dependencyBaseUrl = dependencyBaseUrl || '';
        }

        InlineViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
          var entry = this.entry;
          var dependencies = this.dependencies;

          if (entry && entry.factoryIsReady) {
            return Promise.resolve(entry.factory);
          }

          this.entry = entry = new TemplateRegistryEntry(this.moduleId || this.dependencyBaseUrl);
          entry.template = DOM.createTemplateFromMarkup(this.markup);

          if (dependencies !== null) {
            for (var i = 0, ii = dependencies.length; i < ii; ++i) {
              var current = dependencies[i];

              if (typeof current === 'string' || typeof current === 'function') {
                entry.addDependency(current);
              } else {
                entry.addDependency(current.from, current.as);
              }
            }
          }

          compileInstruction.associatedModuleId = this.moduleId;
          return viewEngine.loadViewFactory(entry, compileInstruction, loadContext, target);
        };

        return InlineViewStrategy;
      }()) || _class6));

      _export('InlineViewStrategy', InlineViewStrategy);

      _export('ViewLocator', ViewLocator = (_temp2 = _class7 = function () {
        function ViewLocator() {
          
        }

        ViewLocator.prototype.getViewStrategy = function getViewStrategy(value) {
          if (!value) {
            return null;
          }

          if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && 'getViewStrategy' in value) {
            var _origin = Origin.get(value.constructor);

            value = value.getViewStrategy();

            if (typeof value === 'string') {
              value = new RelativeViewStrategy(value);
            }

            viewStrategy.assert(value);

            if (_origin.moduleId) {
              value.makeRelativeTo(_origin.moduleId);
            }

            return value;
          }

          if (typeof value === 'string') {
            value = new RelativeViewStrategy(value);
          }

          if (viewStrategy.validate(value)) {
            return value;
          }

          if (typeof value !== 'function') {
            value = value.constructor;
          }

          var origin = Origin.get(value);
          var strategy = metadata.get(ViewLocator.viewStrategyMetadataKey, value);

          if (!strategy) {
            if (!origin.moduleId) {
              throw new Error('Cannot determine default view strategy for object.', value);
            }

            strategy = this.createFallbackViewStrategy(origin);
          } else if (origin.moduleId) {
            strategy.moduleId = origin.moduleId;
          }

          return strategy;
        };

        ViewLocator.prototype.createFallbackViewStrategy = function createFallbackViewStrategy(origin) {
          return new ConventionalViewStrategy(this, origin);
        };

        ViewLocator.prototype.convertOriginToViewUrl = function convertOriginToViewUrl(origin) {
          var moduleId = origin.moduleId;
          var id = moduleId.endsWith('.js') || moduleId.endsWith('.ts') ? moduleId.substring(0, moduleId.length - 3) : moduleId;
          return id + '.html';
        };

        return ViewLocator;
      }(), _class7.viewStrategyMetadataKey = 'aurelia:view-strategy', _temp2));

      _export('ViewLocator', ViewLocator);

      _export('BindingLanguage', BindingLanguage = function () {
        function BindingLanguage() {
          
        }

        BindingLanguage.prototype.inspectAttribute = function inspectAttribute(resources, elementName, attrName, attrValue) {
          mi('inspectAttribute');
        };

        BindingLanguage.prototype.createAttributeInstruction = function createAttributeInstruction(resources, element, info, existingInstruction) {
          mi('createAttributeInstruction');
        };

        BindingLanguage.prototype.inspectTextContent = function inspectTextContent(resources, value) {
          mi('inspectTextContent');
        };

        return BindingLanguage;
      }());

      _export('BindingLanguage', BindingLanguage);

      noNodes = Object.freeze([]);

      _export('SlotCustomAttribute', SlotCustomAttribute = (_dec6 = inject(DOM.Element), _dec6(_class8 = function () {
        function SlotCustomAttribute(element) {
          

          this.element = element;
          this.element.auSlotAttribute = this;
        }

        SlotCustomAttribute.prototype.valueChanged = function valueChanged(newValue, oldValue) {};

        return SlotCustomAttribute;
      }()) || _class8));

      _export('SlotCustomAttribute', SlotCustomAttribute);

      _export('PassThroughSlot', PassThroughSlot = function () {
        function PassThroughSlot(anchor, name, destinationName, fallbackFactory) {
          

          this.anchor = anchor;
          this.anchor.viewSlot = this;
          this.name = name;
          this.destinationName = destinationName;
          this.fallbackFactory = fallbackFactory;
          this.destinationSlot = null;
          this.projections = 0;
          this.contentView = null;

          var attr = new SlotCustomAttribute(this.anchor);
          attr.value = this.destinationName;
        }

        PassThroughSlot.prototype.renderFallbackContent = function renderFallbackContent(view, nodes, projectionSource, index) {
          if (this.contentView === null) {
            this.contentView = this.fallbackFactory.create(this.ownerView.container);
            this.contentView.bind(this.ownerView.bindingContext, this.ownerView.overrideContext);

            var slots = Object.create(null);
            slots[this.destinationSlot.name] = this.destinationSlot;

            ShadowDOM.distributeView(this.contentView, slots, projectionSource, index, this.destinationSlot.name);
          }
        };

        PassThroughSlot.prototype.passThroughTo = function passThroughTo(destinationSlot) {
          this.destinationSlot = destinationSlot;
        };

        PassThroughSlot.prototype.addNode = function addNode(view, node, projectionSource, index) {
          if (this.contentView !== null) {
            this.contentView.removeNodes();
            this.contentView.detached();
            this.contentView.unbind();
            this.contentView = null;
          }

          if (node.viewSlot instanceof PassThroughSlot) {
            node.viewSlot.passThroughTo(this);
            return;
          }

          this.projections++;
          this.destinationSlot.addNode(view, node, projectionSource, index);
        };

        PassThroughSlot.prototype.removeView = function removeView(view, projectionSource) {
          this.projections--;
          this.destinationSlot.removeView(view, projectionSource);

          if (this.needsFallbackRendering) {
            this.renderFallbackContent(null, noNodes, projectionSource);
          }
        };

        PassThroughSlot.prototype.removeAll = function removeAll(projectionSource) {
          this.projections = 0;
          this.destinationSlot.removeAll(projectionSource);

          if (this.needsFallbackRendering) {
            this.renderFallbackContent(null, noNodes, projectionSource);
          }
        };

        PassThroughSlot.prototype.projectFrom = function projectFrom(view, projectionSource) {
          this.destinationSlot.projectFrom(view, projectionSource);
        };

        PassThroughSlot.prototype.created = function created(ownerView) {
          this.ownerView = ownerView;
        };

        PassThroughSlot.prototype.bind = function bind(view) {
          if (this.contentView) {
            this.contentView.bind(view.bindingContext, view.overrideContext);
          }
        };

        PassThroughSlot.prototype.attached = function attached() {
          if (this.contentView) {
            this.contentView.attached();
          }
        };

        PassThroughSlot.prototype.detached = function detached() {
          if (this.contentView) {
            this.contentView.detached();
          }
        };

        PassThroughSlot.prototype.unbind = function unbind() {
          if (this.contentView) {
            this.contentView.unbind();
          }
        };

        _createClass(PassThroughSlot, [{
          key: 'needsFallbackRendering',
          get: function get() {
            return this.fallbackFactory && this.projections === 0;
          }
        }]);

        return PassThroughSlot;
      }());

      _export('PassThroughSlot', PassThroughSlot);

      _export('ShadowSlot', ShadowSlot = function () {
        function ShadowSlot(anchor, name, fallbackFactory) {
          

          this.anchor = anchor;
          this.anchor.isContentProjectionSource = true;
          this.anchor.viewSlot = this;
          this.name = name;
          this.fallbackFactory = fallbackFactory;
          this.contentView = null;
          this.projections = 0;
          this.children = [];
          this.projectFromAnchors = null;
          this.destinationSlots = null;
        }

        ShadowSlot.prototype.addNode = function addNode(view, node, projectionSource, index, destination) {
          if (this.contentView !== null) {
            this.contentView.removeNodes();
            this.contentView.detached();
            this.contentView.unbind();
            this.contentView = null;
          }

          if (node.viewSlot instanceof PassThroughSlot) {
            node.viewSlot.passThroughTo(this);
            return;
          }

          if (this.destinationSlots !== null) {
            ShadowDOM.distributeNodes(view, [node], this.destinationSlots, this, index);
          } else {
            node.auOwnerView = view;
            node.auProjectionSource = projectionSource;
            node.auAssignedSlot = this;

            var anchor = this._findAnchor(view, node, projectionSource, index);
            var parent = anchor.parentNode;

            parent.insertBefore(node, anchor);
            this.children.push(node);
            this.projections++;
          }
        };

        ShadowSlot.prototype.removeView = function removeView(view, projectionSource) {
          if (this.destinationSlots !== null) {
            ShadowDOM.undistributeView(view, this.destinationSlots, this);
          } else if (this.contentView && this.contentView.hasSlots) {
            ShadowDOM.undistributeView(view, this.contentView.slots, projectionSource);
          } else {
            var found = this.children.find(function (x) {
              return x.auSlotProjectFrom === projectionSource;
            });
            if (found) {
              var _children = found.auProjectionChildren;

              for (var i = 0, ii = _children.length; i < ii; ++i) {
                var _child = _children[i];

                if (_child.auOwnerView === view) {
                  _children.splice(i, 1);
                  view.fragment.appendChild(_child);
                  i--;ii--;
                  this.projections--;
                }
              }

              if (this.needsFallbackRendering) {
                this.renderFallbackContent(view, noNodes, projectionSource);
              }
            }
          }
        };

        ShadowSlot.prototype.removeAll = function removeAll(projectionSource) {
          if (this.destinationSlots !== null) {
            ShadowDOM.undistributeAll(this.destinationSlots, this);
          } else if (this.contentView && this.contentView.hasSlots) {
            ShadowDOM.undistributeAll(this.contentView.slots, projectionSource);
          } else {
            var found = this.children.find(function (x) {
              return x.auSlotProjectFrom === projectionSource;
            });

            if (found) {
              var _children2 = found.auProjectionChildren;
              for (var i = 0, ii = _children2.length; i < ii; ++i) {
                var _child2 = _children2[i];
                _child2.auOwnerView.fragment.appendChild(_child2);
                this.projections--;
              }

              found.auProjectionChildren = [];

              if (this.needsFallbackRendering) {
                this.renderFallbackContent(null, noNodes, projectionSource);
              }
            }
          }
        };

        ShadowSlot.prototype._findAnchor = function _findAnchor(view, node, projectionSource, index) {
          if (projectionSource) {
            var found = this.children.find(function (x) {
              return x.auSlotProjectFrom === projectionSource;
            });
            if (found) {
              if (index !== undefined) {
                var _children3 = found.auProjectionChildren;
                var viewIndex = -1;
                var lastView = void 0;

                for (var i = 0, ii = _children3.length; i < ii; ++i) {
                  var current = _children3[i];

                  if (current.auOwnerView !== lastView) {
                    viewIndex++;
                    lastView = current.auOwnerView;

                    if (viewIndex >= index && lastView !== view) {
                      _children3.splice(i, 0, node);
                      return current;
                    }
                  }
                }
              }

              found.auProjectionChildren.push(node);
              return found;
            }
          }

          return this.anchor;
        };

        ShadowSlot.prototype.projectTo = function projectTo(slots) {
          this.destinationSlots = slots;
        };

        ShadowSlot.prototype.projectFrom = function projectFrom(view, projectionSource) {
          var anchor = DOM.createComment('anchor');
          var parent = this.anchor.parentNode;
          anchor.auSlotProjectFrom = projectionSource;
          anchor.auOwnerView = view;
          anchor.auProjectionChildren = [];
          parent.insertBefore(anchor, this.anchor);
          this.children.push(anchor);

          if (this.projectFromAnchors === null) {
            this.projectFromAnchors = [];
          }

          this.projectFromAnchors.push(anchor);
        };

        ShadowSlot.prototype.renderFallbackContent = function renderFallbackContent(view, nodes, projectionSource, index) {
          if (this.contentView === null) {
            this.contentView = this.fallbackFactory.create(this.ownerView.container);
            this.contentView.bind(this.ownerView.bindingContext, this.ownerView.overrideContext);
            this.contentView.insertNodesBefore(this.anchor);
          }

          if (this.contentView.hasSlots) {
            var slots = this.contentView.slots;
            var projectFromAnchors = this.projectFromAnchors;

            if (projectFromAnchors !== null) {
              for (var slotName in slots) {
                var slot = slots[slotName];

                for (var i = 0, ii = projectFromAnchors.length; i < ii; ++i) {
                  var anchor = projectFromAnchors[i];
                  slot.projectFrom(anchor.auOwnerView, anchor.auSlotProjectFrom);
                }
              }
            }

            this.fallbackSlots = slots;
            ShadowDOM.distributeNodes(view, nodes, slots, projectionSource, index);
          }
        };

        ShadowSlot.prototype.created = function created(ownerView) {
          this.ownerView = ownerView;
        };

        ShadowSlot.prototype.bind = function bind(view) {
          if (this.contentView) {
            this.contentView.bind(view.bindingContext, view.overrideContext);
          }
        };

        ShadowSlot.prototype.attached = function attached() {
          if (this.contentView) {
            this.contentView.attached();
          }
        };

        ShadowSlot.prototype.detached = function detached() {
          if (this.contentView) {
            this.contentView.detached();
          }
        };

        ShadowSlot.prototype.unbind = function unbind() {
          if (this.contentView) {
            this.contentView.unbind();
          }
        };

        _createClass(ShadowSlot, [{
          key: 'needsFallbackRendering',
          get: function get() {
            return this.fallbackFactory && this.projections === 0;
          }
        }]);

        return ShadowSlot;
      }());

      _export('ShadowSlot', ShadowSlot);

      _export('ShadowDOM', ShadowDOM = (_temp3 = _class9 = function () {
        function ShadowDOM() {
          
        }

        ShadowDOM.getSlotName = function getSlotName(node) {
          if (node.auSlotAttribute === undefined) {
            return ShadowDOM.defaultSlotKey;
          }

          return node.auSlotAttribute.value;
        };

        ShadowDOM.distributeView = function distributeView(view, slots, projectionSource, index, destinationOverride) {
          var nodes = void 0;

          if (view === null) {
            nodes = noNodes;
          } else {
            var childNodes = view.fragment.childNodes;
            var ii = childNodes.length;
            nodes = new Array(ii);

            for (var i = 0; i < ii; ++i) {
              nodes[i] = childNodes[i];
            }
          }

          ShadowDOM.distributeNodes(view, nodes, slots, projectionSource, index, destinationOverride);
        };

        ShadowDOM.undistributeView = function undistributeView(view, slots, projectionSource) {
          for (var slotName in slots) {
            slots[slotName].removeView(view, projectionSource);
          }
        };

        ShadowDOM.undistributeAll = function undistributeAll(slots, projectionSource) {
          for (var slotName in slots) {
            slots[slotName].removeAll(projectionSource);
          }
        };

        ShadowDOM.distributeNodes = function distributeNodes(view, nodes, slots, projectionSource, index, destinationOverride) {
          for (var i = 0, ii = nodes.length; i < ii; ++i) {
            var currentNode = nodes[i];
            var nodeType = currentNode.nodeType;

            if (currentNode.isContentProjectionSource) {
              currentNode.viewSlot.projectTo(slots);

              for (var slotName in slots) {
                slots[slotName].projectFrom(view, currentNode.viewSlot);
              }

              nodes.splice(i, 1);
              ii--;i--;
            } else if (nodeType === 1 || nodeType === 3 || currentNode.viewSlot instanceof PassThroughSlot) {
              if (nodeType === 3 && _isAllWhitespace(currentNode)) {
                nodes.splice(i, 1);
                ii--;i--;
              } else {
                var found = slots[destinationOverride || ShadowDOM.getSlotName(currentNode)];

                if (found) {
                  found.addNode(view, currentNode, projectionSource, index);
                  nodes.splice(i, 1);
                  ii--;i--;
                }
              }
            } else {
              nodes.splice(i, 1);
              ii--;i--;
            }
          }

          for (var _slotName in slots) {
            var slot = slots[_slotName];

            if (slot.needsFallbackRendering) {
              slot.renderFallbackContent(view, nodes, projectionSource, index);
            }
          }
        };

        return ShadowDOM;
      }(), _class9.defaultSlotKey = '__au-default-slot-key__', _temp3));

      _export('ShadowDOM', ShadowDOM);

      _export('ViewResources', ViewResources = function () {
        function ViewResources(parent, viewUrl) {
          

          this.bindingLanguage = null;

          this.parent = parent || null;
          this.hasParent = this.parent !== null;
          this.viewUrl = viewUrl || '';
          this.lookupFunctions = {
            valueConverters: this.getValueConverter.bind(this),
            bindingBehaviors: this.getBindingBehavior.bind(this)
          };
          this.attributes = Object.create(null);
          this.elements = Object.create(null);
          this.valueConverters = Object.create(null);
          this.bindingBehaviors = Object.create(null);
          this.attributeMap = Object.create(null);
          this.values = Object.create(null);
          this.beforeCompile = this.afterCompile = this.beforeCreate = this.afterCreate = this.beforeBind = this.beforeUnbind = false;
        }

        ViewResources.prototype._tryAddHook = function _tryAddHook(obj, name) {
          if (typeof obj[name] === 'function') {
            var func = obj[name].bind(obj);
            var counter = 1;
            var callbackName = void 0;

            while (this[callbackName = name + counter.toString()] !== undefined) {
              counter++;
            }

            this[name] = true;
            this[callbackName] = func;
          }
        };

        ViewResources.prototype._invokeHook = function _invokeHook(name, one, two, three, four) {
          if (this.hasParent) {
            this.parent._invokeHook(name, one, two, three, four);
          }

          if (this[name]) {
            this[name + '1'](one, two, three, four);

            var callbackName = name + '2';
            if (this[callbackName]) {
              this[callbackName](one, two, three, four);

              callbackName = name + '3';
              if (this[callbackName]) {
                this[callbackName](one, two, three, four);

                var counter = 4;

                while (this[callbackName = name + counter.toString()] !== undefined) {
                  this[callbackName](one, two, three, four);
                  counter++;
                }
              }
            }
          }
        };

        ViewResources.prototype.registerViewEngineHooks = function registerViewEngineHooks(hooks) {
          this._tryAddHook(hooks, 'beforeCompile');
          this._tryAddHook(hooks, 'afterCompile');
          this._tryAddHook(hooks, 'beforeCreate');
          this._tryAddHook(hooks, 'afterCreate');
          this._tryAddHook(hooks, 'beforeBind');
          this._tryAddHook(hooks, 'beforeUnbind');
        };

        ViewResources.prototype.getBindingLanguage = function getBindingLanguage(bindingLanguageFallback) {
          return this.bindingLanguage || (this.bindingLanguage = bindingLanguageFallback);
        };

        ViewResources.prototype.patchInParent = function patchInParent(newParent) {
          var originalParent = this.parent;

          this.parent = newParent || null;
          this.hasParent = this.parent !== null;

          if (newParent.parent === null) {
            newParent.parent = originalParent;
            newParent.hasParent = originalParent !== null;
          }
        };

        ViewResources.prototype.relativeToView = function relativeToView(path) {
          return relativeToFile(path, this.viewUrl);
        };

        ViewResources.prototype.registerElement = function registerElement(tagName, behavior) {
          register(this.elements, tagName, behavior, 'an Element');
        };

        ViewResources.prototype.getElement = function getElement(tagName) {
          return this.elements[tagName] || (this.hasParent ? this.parent.getElement(tagName) : null);
        };

        ViewResources.prototype.mapAttribute = function mapAttribute(attribute) {
          return this.attributeMap[attribute] || (this.hasParent ? this.parent.mapAttribute(attribute) : null);
        };

        ViewResources.prototype.registerAttribute = function registerAttribute(attribute, behavior, knownAttribute) {
          this.attributeMap[attribute] = knownAttribute;
          register(this.attributes, attribute, behavior, 'an Attribute');
        };

        ViewResources.prototype.getAttribute = function getAttribute(attribute) {
          return this.attributes[attribute] || (this.hasParent ? this.parent.getAttribute(attribute) : null);
        };

        ViewResources.prototype.registerValueConverter = function registerValueConverter(name, valueConverter) {
          register(this.valueConverters, name, valueConverter, 'a ValueConverter');
        };

        ViewResources.prototype.getValueConverter = function getValueConverter(name) {
          return this.valueConverters[name] || (this.hasParent ? this.parent.getValueConverter(name) : null);
        };

        ViewResources.prototype.registerBindingBehavior = function registerBindingBehavior(name, bindingBehavior) {
          register(this.bindingBehaviors, name, bindingBehavior, 'a BindingBehavior');
        };

        ViewResources.prototype.getBindingBehavior = function getBindingBehavior(name) {
          return this.bindingBehaviors[name] || (this.hasParent ? this.parent.getBindingBehavior(name) : null);
        };

        ViewResources.prototype.registerValue = function registerValue(name, value) {
          register(this.values, name, value, 'a value');
        };

        ViewResources.prototype.getValue = function getValue(name) {
          return this.values[name] || (this.hasParent ? this.parent.getValue(name) : null);
        };

        return ViewResources;
      }());

      _export('ViewResources', ViewResources);

      _export('View', View = function () {
        function View(container, viewFactory, fragment, controllers, bindings, children, slots) {
          

          this.container = container;
          this.viewFactory = viewFactory;
          this.resources = viewFactory.resources;
          this.fragment = fragment;
          this.firstChild = fragment.firstChild;
          this.lastChild = fragment.lastChild;
          this.controllers = controllers;
          this.bindings = bindings;
          this.children = children;
          this.slots = slots;
          this.hasSlots = false;
          this.fromCache = false;
          this.isBound = false;
          this.isAttached = false;
          this.bindingContext = null;
          this.overrideContext = null;
          this.controller = null;
          this.viewModelScope = null;
          this.animatableElement = undefined;
          this._isUserControlled = false;
          this.contentView = null;

          for (var key in slots) {
            this.hasSlots = true;
            break;
          }
        }

        View.prototype.returnToCache = function returnToCache() {
          this.viewFactory.returnViewToCache(this);
        };

        View.prototype.created = function created() {
          var i = void 0;
          var ii = void 0;
          var controllers = this.controllers;

          for (i = 0, ii = controllers.length; i < ii; ++i) {
            controllers[i].created(this);
          }
        };

        View.prototype.bind = function bind(bindingContext, overrideContext, _systemUpdate) {
          var controllers = void 0;
          var bindings = void 0;
          var children = void 0;
          var i = void 0;
          var ii = void 0;

          if (_systemUpdate && this._isUserControlled) {
            return;
          }

          if (this.isBound) {
            if (this.bindingContext === bindingContext) {
              return;
            }

            this.unbind();
          }

          this.isBound = true;
          this.bindingContext = bindingContext;
          this.overrideContext = overrideContext || createOverrideContext(bindingContext);

          this.resources._invokeHook('beforeBind', this);

          bindings = this.bindings;
          for (i = 0, ii = bindings.length; i < ii; ++i) {
            bindings[i].bind(this);
          }

          if (this.viewModelScope !== null) {
            bindingContext.bind(this.viewModelScope.bindingContext, this.viewModelScope.overrideContext);
            this.viewModelScope = null;
          }

          controllers = this.controllers;
          for (i = 0, ii = controllers.length; i < ii; ++i) {
            controllers[i].bind(this);
          }

          children = this.children;
          for (i = 0, ii = children.length; i < ii; ++i) {
            children[i].bind(bindingContext, overrideContext, true);
          }

          if (this.hasSlots) {
            ShadowDOM.distributeView(this.contentView, this.slots);
          }
        };

        View.prototype.addBinding = function addBinding(binding) {
          this.bindings.push(binding);

          if (this.isBound) {
            binding.bind(this);
          }
        };

        View.prototype.unbind = function unbind() {
          var controllers = void 0;
          var bindings = void 0;
          var children = void 0;
          var i = void 0;
          var ii = void 0;

          if (this.isBound) {
            this.isBound = false;
            this.resources._invokeHook('beforeUnbind', this);

            if (this.controller !== null) {
              this.controller.unbind();
            }

            bindings = this.bindings;
            for (i = 0, ii = bindings.length; i < ii; ++i) {
              bindings[i].unbind();
            }

            controllers = this.controllers;
            for (i = 0, ii = controllers.length; i < ii; ++i) {
              controllers[i].unbind();
            }

            children = this.children;
            for (i = 0, ii = children.length; i < ii; ++i) {
              children[i].unbind();
            }

            this.bindingContext = null;
            this.overrideContext = null;
          }
        };

        View.prototype.insertNodesBefore = function insertNodesBefore(refNode) {
          refNode.parentNode.insertBefore(this.fragment, refNode);
        };

        View.prototype.appendNodesTo = function appendNodesTo(parent) {
          parent.appendChild(this.fragment);
        };

        View.prototype.removeNodes = function removeNodes() {
          var fragment = this.fragment;
          var current = this.firstChild;
          var end = this.lastChild;
          var next = void 0;

          while (current) {
            next = current.nextSibling;
            fragment.appendChild(current);

            if (current === end) {
              break;
            }

            current = next;
          }
        };

        View.prototype.attached = function attached() {
          var controllers = void 0;
          var children = void 0;
          var i = void 0;
          var ii = void 0;

          if (this.isAttached) {
            return;
          }

          this.isAttached = true;

          if (this.controller !== null) {
            this.controller.attached();
          }

          controllers = this.controllers;
          for (i = 0, ii = controllers.length; i < ii; ++i) {
            controllers[i].attached();
          }

          children = this.children;
          for (i = 0, ii = children.length; i < ii; ++i) {
            children[i].attached();
          }
        };

        View.prototype.detached = function detached() {
          var controllers = void 0;
          var children = void 0;
          var i = void 0;
          var ii = void 0;

          if (this.isAttached) {
            this.isAttached = false;

            if (this.controller !== null) {
              this.controller.detached();
            }

            controllers = this.controllers;
            for (i = 0, ii = controllers.length; i < ii; ++i) {
              controllers[i].detached();
            }

            children = this.children;
            for (i = 0, ii = children.length; i < ii; ++i) {
              children[i].detached();
            }
          }
        };

        return View;
      }());

      _export('View', View);

      _export('ViewSlot', ViewSlot = function () {
        function ViewSlot(anchor, anchorIsContainer) {
          var animator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Animator.instance;

          

          this.anchor = anchor;
          this.anchorIsContainer = anchorIsContainer;
          this.bindingContext = null;
          this.overrideContext = null;
          this.animator = animator;
          this.children = [];
          this.isBound = false;
          this.isAttached = false;
          this.contentSelectors = null;
          anchor.viewSlot = this;
          anchor.isContentProjectionSource = false;
        }

        ViewSlot.prototype.animateView = function animateView(view) {
          var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'enter';

          var animatableElement = getAnimatableElement(view);

          if (animatableElement !== null) {
            switch (direction) {
              case 'enter':
                return this.animator.enter(animatableElement);
              case 'leave':
                return this.animator.leave(animatableElement);
              default:
                throw new Error('Invalid animation direction: ' + direction);
            }
          }
        };

        ViewSlot.prototype.transformChildNodesIntoView = function transformChildNodesIntoView() {
          var parent = this.anchor;

          this.children.push({
            fragment: parent,
            firstChild: parent.firstChild,
            lastChild: parent.lastChild,
            returnToCache: function returnToCache() {},
            removeNodes: function removeNodes() {
              var last = void 0;

              while (last = parent.lastChild) {
                parent.removeChild(last);
              }
            },
            created: function created() {},
            bind: function bind() {},
            unbind: function unbind() {},
            attached: function attached() {},
            detached: function detached() {}
          });
        };

        ViewSlot.prototype.bind = function bind(bindingContext, overrideContext) {
          var i = void 0;
          var ii = void 0;
          var children = void 0;

          if (this.isBound) {
            if (this.bindingContext === bindingContext) {
              return;
            }

            this.unbind();
          }

          this.isBound = true;
          this.bindingContext = bindingContext = bindingContext || this.bindingContext;
          this.overrideContext = overrideContext = overrideContext || this.overrideContext;

          children = this.children;
          for (i = 0, ii = children.length; i < ii; ++i) {
            children[i].bind(bindingContext, overrideContext, true);
          }
        };

        ViewSlot.prototype.unbind = function unbind() {
          if (this.isBound) {
            var i = void 0;
            var ii = void 0;
            var _children4 = this.children;

            this.isBound = false;
            this.bindingContext = null;
            this.overrideContext = null;

            for (i = 0, ii = _children4.length; i < ii; ++i) {
              _children4[i].unbind();
            }
          }
        };

        ViewSlot.prototype.add = function add(view) {
          if (this.anchorIsContainer) {
            view.appendNodesTo(this.anchor);
          } else {
            view.insertNodesBefore(this.anchor);
          }

          this.children.push(view);

          if (this.isAttached) {
            view.attached();
            return this.animateView(view, 'enter');
          }
        };

        ViewSlot.prototype.insert = function insert(index, view) {
          var children = this.children;
          var length = children.length;

          if (index === 0 && length === 0 || index >= length) {
            return this.add(view);
          }

          view.insertNodesBefore(children[index].firstChild);
          children.splice(index, 0, view);

          if (this.isAttached) {
            view.attached();
            return this.animateView(view, 'enter');
          }
        };

        ViewSlot.prototype.move = function move(sourceIndex, targetIndex) {
          if (sourceIndex === targetIndex) {
            return;
          }

          var children = this.children;
          var view = children[sourceIndex];

          view.removeNodes();
          view.insertNodesBefore(children[targetIndex].firstChild);
          children.splice(sourceIndex, 1);
          children.splice(targetIndex, 0, view);
        };

        ViewSlot.prototype.remove = function remove(view, returnToCache, skipAnimation) {
          return this.removeAt(this.children.indexOf(view), returnToCache, skipAnimation);
        };

        ViewSlot.prototype.removeMany = function removeMany(viewsToRemove, returnToCache, skipAnimation) {
          var _this4 = this;

          var children = this.children;
          var ii = viewsToRemove.length;
          var i = void 0;
          var rmPromises = [];

          viewsToRemove.forEach(function (child) {
            if (skipAnimation) {
              child.removeNodes();
              return;
            }

            var animation = _this4.animateView(child, 'leave');
            if (animation) {
              rmPromises.push(animation.then(function () {
                return child.removeNodes();
              }));
            } else {
              child.removeNodes();
            }
          });

          var removeAction = function removeAction() {
            if (_this4.isAttached) {
              for (i = 0; i < ii; ++i) {
                viewsToRemove[i].detached();
              }
            }

            if (returnToCache) {
              for (i = 0; i < ii; ++i) {
                viewsToRemove[i].returnToCache();
              }
            }

            for (i = 0; i < ii; ++i) {
              var index = children.indexOf(viewsToRemove[i]);
              if (index >= 0) {
                children.splice(index, 1);
              }
            }
          };

          if (rmPromises.length > 0) {
            return Promise.all(rmPromises).then(function () {
              return removeAction();
            });
          }

          return removeAction();
        };

        ViewSlot.prototype.removeAt = function removeAt(index, returnToCache, skipAnimation) {
          var _this5 = this;

          var view = this.children[index];

          var removeAction = function removeAction() {
            index = _this5.children.indexOf(view);
            view.removeNodes();
            _this5.children.splice(index, 1);

            if (_this5.isAttached) {
              view.detached();
            }

            if (returnToCache) {
              view.returnToCache();
            }

            return view;
          };

          if (!skipAnimation) {
            var animation = this.animateView(view, 'leave');
            if (animation) {
              return animation.then(function () {
                return removeAction();
              });
            }
          }

          return removeAction();
        };

        ViewSlot.prototype.removeAll = function removeAll(returnToCache, skipAnimation) {
          var _this6 = this;

          var children = this.children;
          var ii = children.length;
          var i = void 0;
          var rmPromises = [];

          children.forEach(function (child) {
            if (skipAnimation) {
              child.removeNodes();
              return;
            }

            var animation = _this6.animateView(child, 'leave');
            if (animation) {
              rmPromises.push(animation.then(function () {
                return child.removeNodes();
              }));
            } else {
              child.removeNodes();
            }
          });

          var removeAction = function removeAction() {
            if (_this6.isAttached) {
              for (i = 0; i < ii; ++i) {
                children[i].detached();
              }
            }

            if (returnToCache) {
              for (i = 0; i < ii; ++i) {
                var _child3 = children[i];

                if (_child3) {
                  _child3.returnToCache();
                }
              }
            }

            _this6.children = [];
          };

          if (rmPromises.length > 0) {
            return Promise.all(rmPromises).then(function () {
              return removeAction();
            });
          }

          return removeAction();
        };

        ViewSlot.prototype.attached = function attached() {
          var i = void 0;
          var ii = void 0;
          var children = void 0;
          var child = void 0;

          if (this.isAttached) {
            return;
          }

          this.isAttached = true;

          children = this.children;
          for (i = 0, ii = children.length; i < ii; ++i) {
            child = children[i];
            child.attached();
            this.animateView(child, 'enter');
          }
        };

        ViewSlot.prototype.detached = function detached() {
          var i = void 0;
          var ii = void 0;
          var children = void 0;

          if (this.isAttached) {
            this.isAttached = false;
            children = this.children;
            for (i = 0, ii = children.length; i < ii; ++i) {
              children[i].detached();
            }
          }
        };

        ViewSlot.prototype.projectTo = function projectTo(slots) {
          var _this7 = this;

          this.projectToSlots = slots;
          this.add = this._projectionAdd;
          this.insert = this._projectionInsert;
          this.move = this._projectionMove;
          this.remove = this._projectionRemove;
          this.removeAt = this._projectionRemoveAt;
          this.removeMany = this._projectionRemoveMany;
          this.removeAll = this._projectionRemoveAll;
          this.children.forEach(function (view) {
            return ShadowDOM.distributeView(view, slots, _this7);
          });
        };

        ViewSlot.prototype._projectionAdd = function _projectionAdd(view) {
          ShadowDOM.distributeView(view, this.projectToSlots, this);

          this.children.push(view);

          if (this.isAttached) {
            view.attached();
          }
        };

        ViewSlot.prototype._projectionInsert = function _projectionInsert(index, view) {
          if (index === 0 && !this.children.length || index >= this.children.length) {
            this.add(view);
          } else {
            ShadowDOM.distributeView(view, this.projectToSlots, this, index);

            this.children.splice(index, 0, view);

            if (this.isAttached) {
              view.attached();
            }
          }
        };

        ViewSlot.prototype._projectionMove = function _projectionMove(sourceIndex, targetIndex) {
          if (sourceIndex === targetIndex) {
            return;
          }

          var children = this.children;
          var view = children[sourceIndex];

          ShadowDOM.undistributeView(view, this.projectToSlots, this);
          ShadowDOM.distributeView(view, this.projectToSlots, this, targetIndex);

          children.splice(sourceIndex, 1);
          children.splice(targetIndex, 0, view);
        };

        ViewSlot.prototype._projectionRemove = function _projectionRemove(view, returnToCache) {
          ShadowDOM.undistributeView(view, this.projectToSlots, this);
          this.children.splice(this.children.indexOf(view), 1);

          if (this.isAttached) {
            view.detached();
          }
        };

        ViewSlot.prototype._projectionRemoveAt = function _projectionRemoveAt(index, returnToCache) {
          var view = this.children[index];

          ShadowDOM.undistributeView(view, this.projectToSlots, this);
          this.children.splice(index, 1);

          if (this.isAttached) {
            view.detached();
          }
        };

        ViewSlot.prototype._projectionRemoveMany = function _projectionRemoveMany(viewsToRemove, returnToCache) {
          var _this8 = this;

          viewsToRemove.forEach(function (view) {
            return _this8.remove(view, returnToCache);
          });
        };

        ViewSlot.prototype._projectionRemoveAll = function _projectionRemoveAll(returnToCache) {
          ShadowDOM.undistributeAll(this.projectToSlots, this);

          var children = this.children;

          if (this.isAttached) {
            for (var i = 0, ii = children.length; i < ii; ++i) {
              children[i].detached();
            }
          }

          this.children = [];
        };

        return ViewSlot;
      }());

      _export('ViewSlot', ViewSlot);

      ProviderResolver = resolver(_class11 = function () {
        function ProviderResolver() {
          
        }

        ProviderResolver.prototype.get = function get(container, key) {
          var id = key.__providerId__;
          return id in container ? container[id] : container[id] = container.invoke(key);
        };

        return ProviderResolver;
      }()) || _class11;
      providerResolverInstance = new ProviderResolver();

      _export('BoundViewFactory', BoundViewFactory = function () {
        function BoundViewFactory(parentContainer, viewFactory, partReplacements) {
          

          this.parentContainer = parentContainer;
          this.viewFactory = viewFactory;
          this.factoryCreateInstruction = { partReplacements: partReplacements };
        }

        BoundViewFactory.prototype.create = function create() {
          var view = this.viewFactory.create(this.parentContainer.createChild(), this.factoryCreateInstruction);
          view._isUserControlled = true;
          return view;
        };

        BoundViewFactory.prototype.setCacheSize = function setCacheSize(size, doNotOverrideIfAlreadySet) {
          this.viewFactory.setCacheSize(size, doNotOverrideIfAlreadySet);
        };

        BoundViewFactory.prototype.getCachedView = function getCachedView() {
          return this.viewFactory.getCachedView();
        };

        BoundViewFactory.prototype.returnViewToCache = function returnViewToCache(view) {
          this.viewFactory.returnViewToCache(view);
        };

        _createClass(BoundViewFactory, [{
          key: 'isCaching',
          get: function get() {
            return this.viewFactory.isCaching;
          }
        }]);

        return BoundViewFactory;
      }());

      _export('BoundViewFactory', BoundViewFactory);

      _export('ViewFactory', ViewFactory = function () {
        function ViewFactory(template, instructions, resources) {
          

          this.isCaching = false;

          this.template = template;
          this.instructions = instructions;
          this.resources = resources;
          this.cacheSize = -1;
          this.cache = null;
        }

        ViewFactory.prototype.setCacheSize = function setCacheSize(size, doNotOverrideIfAlreadySet) {
          if (size) {
            if (size === '*') {
              size = Number.MAX_VALUE;
            } else if (typeof size === 'string') {
              size = parseInt(size, 10);
            }
          }

          if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
            this.cacheSize = size;
          }

          if (this.cacheSize > 0) {
            this.cache = [];
          } else {
            this.cache = null;
          }

          this.isCaching = this.cacheSize > 0;
        };

        ViewFactory.prototype.getCachedView = function getCachedView() {
          return this.cache !== null ? this.cache.pop() || null : null;
        };

        ViewFactory.prototype.returnViewToCache = function returnViewToCache(view) {
          if (view.isAttached) {
            view.detached();
          }

          if (view.isBound) {
            view.unbind();
          }

          if (this.cache !== null && this.cache.length < this.cacheSize) {
            view.fromCache = true;
            this.cache.push(view);
          }
        };

        ViewFactory.prototype.create = function create(container, createInstruction, element) {
          createInstruction = createInstruction || BehaviorInstruction.normal;

          var cachedView = this.getCachedView();
          if (cachedView !== null) {
            return cachedView;
          }

          var fragment = createInstruction.enhance ? this.template : this.template.cloneNode(true);
          var instructables = fragment.querySelectorAll('.au-target');
          var instructions = this.instructions;
          var resources = this.resources;
          var controllers = [];
          var bindings = [];
          var children = [];
          var shadowSlots = Object.create(null);
          var containers = { root: container };
          var partReplacements = createInstruction.partReplacements;
          var i = void 0;
          var ii = void 0;
          var view = void 0;
          var instructable = void 0;
          var instruction = void 0;

          this.resources._invokeHook('beforeCreate', this, container, fragment, createInstruction);

          if (element && this.surrogateInstruction !== null) {
            applySurrogateInstruction(container, element, this.surrogateInstruction, controllers, bindings, children);
          }

          if (createInstruction.enhance && fragment.hasAttribute('au-target-id')) {
            instructable = fragment;
            instruction = instructions[instructable.getAttribute('au-target-id')];
            applyInstructions(containers, instructable, instruction, controllers, bindings, children, shadowSlots, partReplacements, resources);
          }

          for (i = 0, ii = instructables.length; i < ii; ++i) {
            instructable = instructables[i];
            instruction = instructions[instructable.getAttribute('au-target-id')];
            applyInstructions(containers, instructable, instruction, controllers, bindings, children, shadowSlots, partReplacements, resources);
          }

          view = new View(container, this, fragment, controllers, bindings, children, shadowSlots);

          if (!createInstruction.initiatedByBehavior) {
            view.created();
          }

          this.resources._invokeHook('afterCreate', view);

          return view;
        };

        return ViewFactory;
      }());

      _export('ViewFactory', ViewFactory);

      nextInjectorId = 0;
      lastAUTargetID = 0;

      _export('ViewCompiler', ViewCompiler = (_dec7 = inject(BindingLanguage, ViewResources), _dec7(_class13 = function () {
        function ViewCompiler(bindingLanguage, resources) {
          

          this.bindingLanguage = bindingLanguage;
          this.resources = resources;
        }

        ViewCompiler.prototype.compile = function compile(source, resources, compileInstruction) {
          resources = resources || this.resources;
          compileInstruction = compileInstruction || ViewCompileInstruction.normal;
          source = typeof source === 'string' ? DOM.createTemplateFromMarkup(source) : source;

          var content = void 0;
          var part = void 0;
          var cacheSize = void 0;

          if (source.content) {
            part = source.getAttribute('part');
            cacheSize = source.getAttribute('view-cache');
            content = DOM.adoptNode(source.content);
          } else {
            content = source;
          }

          compileInstruction.targetShadowDOM = compileInstruction.targetShadowDOM && FEATURE.shadowDOM;
          resources._invokeHook('beforeCompile', content, resources, compileInstruction);

          var instructions = {};
          this._compileNode(content, resources, instructions, source, 'root', !compileInstruction.targetShadowDOM);

          var firstChild = content.firstChild;
          if (firstChild && firstChild.nodeType === 1) {
            var targetId = firstChild.getAttribute('au-target-id');
            if (targetId) {
              var ins = instructions[targetId];

              if (ins.shadowSlot || ins.lifting || ins.elementInstruction && !ins.elementInstruction.anchorIsContainer) {
                content.insertBefore(DOM.createComment('view'), firstChild);
              }
            }
          }

          var factory = new ViewFactory(content, instructions, resources);

          factory.surrogateInstruction = compileInstruction.compileSurrogate ? this._compileSurrogate(source, resources) : null;
          factory.part = part;

          if (cacheSize) {
            factory.setCacheSize(cacheSize);
          }

          resources._invokeHook('afterCompile', factory);

          return factory;
        };

        ViewCompiler.prototype._compileNode = function _compileNode(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM) {
          switch (node.nodeType) {
            case 1:
              return this._compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM);
            case 3:
              var expression = resources.getBindingLanguage(this.bindingLanguage).inspectTextContent(resources, node.wholeText);
              if (expression) {
                var marker = DOM.createElement('au-marker');
                var auTargetID = makeIntoInstructionTarget(marker);
                (node.parentNode || parentNode).insertBefore(marker, node);
                node.textContent = ' ';
                instructions[auTargetID] = TargetInstruction.contentExpression(expression);

                while (node.nextSibling && node.nextSibling.nodeType === 3) {
                  (node.parentNode || parentNode).removeChild(node.nextSibling);
                }
              } else {
                while (node.nextSibling && node.nextSibling.nodeType === 3) {
                  node = node.nextSibling;
                }
              }
              return node.nextSibling;
            case 11:
              var currentChild = node.firstChild;
              while (currentChild) {
                currentChild = this._compileNode(currentChild, resources, instructions, node, parentInjectorId, targetLightDOM);
              }
              break;
            default:
              break;
          }

          return node.nextSibling;
        };

        ViewCompiler.prototype._compileSurrogate = function _compileSurrogate(node, resources) {
          var tagName = node.tagName.toLowerCase();
          var attributes = node.attributes;
          var bindingLanguage = resources.getBindingLanguage(this.bindingLanguage);
          var knownAttribute = void 0;
          var property = void 0;
          var instruction = void 0;
          var i = void 0;
          var ii = void 0;
          var attr = void 0;
          var attrName = void 0;
          var attrValue = void 0;
          var info = void 0;
          var type = void 0;
          var expressions = [];
          var expression = void 0;
          var behaviorInstructions = [];
          var values = {};
          var hasValues = false;
          var providers = [];

          for (i = 0, ii = attributes.length; i < ii; ++i) {
            attr = attributes[i];
            attrName = attr.name;
            attrValue = attr.value;

            info = bindingLanguage.inspectAttribute(resources, tagName, attrName, attrValue);
            type = resources.getAttribute(info.attrName);

            if (type) {
              knownAttribute = resources.mapAttribute(info.attrName);
              if (knownAttribute) {
                property = type.attributes[knownAttribute];

                if (property) {
                  info.defaultBindingMode = property.defaultBindingMode;

                  if (!info.command && !info.expression) {
                    info.command = property.hasOptions ? 'options' : null;
                  }

                  if (info.command && info.command !== 'options' && type.primaryProperty) {
                    var primaryProperty = type.primaryProperty;
                    attrName = info.attrName = primaryProperty.name;

                    info.defaultBindingMode = primaryProperty.defaultBindingMode;
                  }
                }
              }
            }

            instruction = bindingLanguage.createAttributeInstruction(resources, node, info, undefined, type);

            if (instruction) {
              if (instruction.alteredAttr) {
                type = resources.getAttribute(instruction.attrName);
              }

              if (instruction.discrete) {
                expressions.push(instruction);
              } else {
                if (type) {
                  instruction.type = type;
                  this._configureProperties(instruction, resources);

                  if (type.liftsContent) {
                    throw new Error('You cannot place a template controller on a surrogate element.');
                  } else {
                    behaviorInstructions.push(instruction);
                  }
                } else {
                  expressions.push(instruction.attributes[instruction.attrName]);
                }
              }
            } else {
              if (type) {
                instruction = BehaviorInstruction.attribute(attrName, type);
                instruction.attributes[resources.mapAttribute(attrName)] = attrValue;

                if (type.liftsContent) {
                  throw new Error('You cannot place a template controller on a surrogate element.');
                } else {
                  behaviorInstructions.push(instruction);
                }
              } else if (attrName !== 'id' && attrName !== 'part' && attrName !== 'replace-part') {
                hasValues = true;
                values[attrName] = attrValue;
              }
            }
          }

          if (expressions.length || behaviorInstructions.length || hasValues) {
            for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
              instruction = behaviorInstructions[i];
              instruction.type.compile(this, resources, node, instruction);
              providers.push(instruction.type.target);
            }

            for (i = 0, ii = expressions.length; i < ii; ++i) {
              expression = expressions[i];
              if (expression.attrToRemove !== undefined) {
                node.removeAttribute(expression.attrToRemove);
              }
            }

            return TargetInstruction.surrogate(providers, behaviorInstructions, expressions, values);
          }

          return null;
        };

        ViewCompiler.prototype._compileElement = function _compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM) {
          var tagName = node.tagName.toLowerCase();
          var attributes = node.attributes;
          var expressions = [];
          var expression = void 0;
          var behaviorInstructions = [];
          var providers = [];
          var bindingLanguage = resources.getBindingLanguage(this.bindingLanguage);
          var liftingInstruction = void 0;
          var viewFactory = void 0;
          var type = void 0;
          var elementInstruction = void 0;
          var elementProperty = void 0;
          var i = void 0;
          var ii = void 0;
          var attr = void 0;
          var attrName = void 0;
          var attrValue = void 0;
          var instruction = void 0;
          var info = void 0;
          var property = void 0;
          var knownAttribute = void 0;
          var auTargetID = void 0;
          var injectorId = void 0;

          if (tagName === 'slot') {
            if (targetLightDOM) {
              node = makeShadowSlot(this, resources, node, instructions, parentInjectorId);
            }
            return node.nextSibling;
          } else if (tagName === 'template') {
            viewFactory = this.compile(node, resources);
            viewFactory.part = node.getAttribute('part');
          } else {
            type = resources.getElement(node.getAttribute('as-element') || tagName);
            if (type) {
              elementInstruction = BehaviorInstruction.element(node, type);
              type.processAttributes(this, resources, node, attributes, elementInstruction);
              behaviorInstructions.push(elementInstruction);
            }
          }

          for (i = 0, ii = attributes.length; i < ii; ++i) {
            attr = attributes[i];
            attrName = attr.name;
            attrValue = attr.value;
            info = bindingLanguage.inspectAttribute(resources, tagName, attrName, attrValue);

            if (targetLightDOM && info.attrName === 'slot') {
              info.attrName = attrName = 'au-slot';
            }

            type = resources.getAttribute(info.attrName);
            elementProperty = null;

            if (type) {
              knownAttribute = resources.mapAttribute(info.attrName);
              if (knownAttribute) {
                property = type.attributes[knownAttribute];

                if (property) {
                  info.defaultBindingMode = property.defaultBindingMode;

                  if (!info.command && !info.expression) {
                    info.command = property.hasOptions ? 'options' : null;
                  }

                  if (info.command && info.command !== 'options' && type.primaryProperty) {
                    var primaryProperty = type.primaryProperty;
                    attrName = info.attrName = primaryProperty.name;

                    info.defaultBindingMode = primaryProperty.defaultBindingMode;
                  }
                }
              }
            } else if (elementInstruction) {
              elementProperty = elementInstruction.type.attributes[info.attrName];
              if (elementProperty) {
                info.defaultBindingMode = elementProperty.defaultBindingMode;
              }
            }

            if (elementProperty) {
              instruction = bindingLanguage.createAttributeInstruction(resources, node, info, elementInstruction);
            } else {
              instruction = bindingLanguage.createAttributeInstruction(resources, node, info, undefined, type);
            }

            if (instruction) {
              if (instruction.alteredAttr) {
                type = resources.getAttribute(instruction.attrName);
              }

              if (instruction.discrete) {
                expressions.push(instruction);
              } else {
                if (type) {
                  instruction.type = type;
                  this._configureProperties(instruction, resources);

                  if (type.liftsContent) {
                    instruction.originalAttrName = attrName;
                    liftingInstruction = instruction;
                    break;
                  } else {
                    behaviorInstructions.push(instruction);
                  }
                } else if (elementProperty) {
                  elementInstruction.attributes[info.attrName].targetProperty = elementProperty.name;
                } else {
                  expressions.push(instruction.attributes[instruction.attrName]);
                }
              }
            } else {
              if (type) {
                instruction = BehaviorInstruction.attribute(attrName, type);
                instruction.attributes[resources.mapAttribute(attrName)] = attrValue;

                if (type.liftsContent) {
                  instruction.originalAttrName = attrName;
                  liftingInstruction = instruction;
                  break;
                } else {
                  behaviorInstructions.push(instruction);
                }
              } else if (elementProperty) {
                elementInstruction.attributes[attrName] = attrValue;
              }
            }
          }

          if (liftingInstruction) {
            liftingInstruction.viewFactory = viewFactory;
            node = liftingInstruction.type.compile(this, resources, node, liftingInstruction, parentNode);
            auTargetID = makeIntoInstructionTarget(node);
            instructions[auTargetID] = TargetInstruction.lifting(parentInjectorId, liftingInstruction);
          } else {
            if (expressions.length || behaviorInstructions.length) {
              injectorId = behaviorInstructions.length ? getNextInjectorId() : false;

              for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
                instruction = behaviorInstructions[i];
                instruction.type.compile(this, resources, node, instruction, parentNode);
                providers.push(instruction.type.target);
              }

              for (i = 0, ii = expressions.length; i < ii; ++i) {
                expression = expressions[i];
                if (expression.attrToRemove !== undefined) {
                  node.removeAttribute(expression.attrToRemove);
                }
              }

              auTargetID = makeIntoInstructionTarget(node);
              instructions[auTargetID] = TargetInstruction.normal(injectorId, parentInjectorId, providers, behaviorInstructions, expressions, elementInstruction);
            }

            if (elementInstruction && elementInstruction.skipContentProcessing) {
              return node.nextSibling;
            }

            var currentChild = node.firstChild;
            while (currentChild) {
              currentChild = this._compileNode(currentChild, resources, instructions, node, injectorId || parentInjectorId, targetLightDOM);
            }
          }

          return node.nextSibling;
        };

        ViewCompiler.prototype._configureProperties = function _configureProperties(instruction, resources) {
          var type = instruction.type;
          var attrName = instruction.attrName;
          var attributes = instruction.attributes;
          var property = void 0;
          var key = void 0;
          var value = void 0;

          var knownAttribute = resources.mapAttribute(attrName);
          if (knownAttribute && attrName in attributes && knownAttribute !== attrName) {
            attributes[knownAttribute] = attributes[attrName];
            delete attributes[attrName];
          }

          for (key in attributes) {
            value = attributes[key];

            if (value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
              property = type.attributes[key];

              if (property !== undefined) {
                value.targetProperty = property.name;
              } else {
                value.targetProperty = key;
              }
            }
          }
        };

        return ViewCompiler;
      }()) || _class13));

      _export('ViewCompiler', ViewCompiler);

      _export('ResourceModule', ResourceModule = function () {
        function ResourceModule(moduleId) {
          

          this.id = moduleId;
          this.moduleInstance = null;
          this.mainResource = null;
          this.resources = null;
          this.viewStrategy = null;
          this.isInitialized = false;
          this.onLoaded = null;
          this.loadContext = null;
        }

        ResourceModule.prototype.initialize = function initialize(container) {
          var current = this.mainResource;
          var resources = this.resources;
          var vs = this.viewStrategy;

          if (this.isInitialized) {
            return;
          }

          this.isInitialized = true;

          if (current !== undefined) {
            current.metadata.viewStrategy = vs;
            current.initialize(container);
          }

          for (var i = 0, ii = resources.length; i < ii; ++i) {
            current = resources[i];
            current.metadata.viewStrategy = vs;
            current.initialize(container);
          }
        };

        ResourceModule.prototype.register = function register(registry, name) {
          var main = this.mainResource;
          var resources = this.resources;

          if (main !== undefined) {
            main.register(registry, name);
            name = null;
          }

          var _loop = function _loop(i, ii) {
            resources[i].register(registry, name);
            name = null;
            if (resources[i].metadata.aliases && resources[i].metadata.aliases.length > 0) {
              resources[i].metadata.aliases.forEach(function (alias) {
                registry.registerAttribute(alias, resources[i].metadata, alias);
                var r = registry.getAttribute(alias);
                r.attributeName = alias;
                r.attributes[alias] = resources[i].metadata.attributes[resources[i].metadata.attributeName];
              });
            }
          };

          for (var i = 0, ii = resources.length; i < ii; ++i) {
            _loop(i, ii);
          }
        };

        ResourceModule.prototype.load = function load(container, loadContext) {
          if (this.onLoaded !== null) {
            return this.loadContext === loadContext ? Promise.resolve() : this.onLoaded;
          }

          var main = this.mainResource;
          var resources = this.resources;
          var loads = void 0;

          if (main !== undefined) {
            loads = new Array(resources.length + 1);
            loads[0] = main.load(container, loadContext);
            for (var i = 0, ii = resources.length; i < ii; ++i) {
              loads[i + 1] = resources[i].load(container, loadContext);
            }
          } else {
            loads = new Array(resources.length);
            for (var _i = 0, _ii = resources.length; _i < _ii; ++_i) {
              loads[_i] = resources[_i].load(container, loadContext);
            }
          }

          this.loadContext = loadContext;
          this.onLoaded = Promise.all(loads);
          return this.onLoaded;
        };

        return ResourceModule;
      }());

      _export('ResourceModule', ResourceModule);

      _export('ResourceDescription', ResourceDescription = function () {
        function ResourceDescription(key, exportedValue, resourceTypeMeta) {
          

          if (!resourceTypeMeta) {
            resourceTypeMeta = metadata.get(metadata.resource, exportedValue);

            if (!resourceTypeMeta) {
              resourceTypeMeta = new HtmlBehaviorResource();
              resourceTypeMeta.elementName = _hyphenate(key);
              metadata.define(metadata.resource, resourceTypeMeta, exportedValue);
            }
          }

          if (resourceTypeMeta instanceof HtmlBehaviorResource) {
            if (resourceTypeMeta.elementName === undefined) {
              resourceTypeMeta.elementName = _hyphenate(key);
            } else if (resourceTypeMeta.attributeName === undefined) {
              resourceTypeMeta.attributeName = _hyphenate(key);
            } else if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
              HtmlBehaviorResource.convention(key, resourceTypeMeta);
            }
          } else if (!resourceTypeMeta.name) {
            resourceTypeMeta.name = _hyphenate(key);
          }

          this.metadata = resourceTypeMeta;
          this.value = exportedValue;
        }

        ResourceDescription.prototype.initialize = function initialize(container) {
          this.metadata.initialize(container, this.value);
        };

        ResourceDescription.prototype.register = function register(registry, name) {
          this.metadata.register(registry, name);
        };

        ResourceDescription.prototype.load = function load(container, loadContext) {
          return this.metadata.load(container, this.value, loadContext);
        };

        return ResourceDescription;
      }());

      _export('ResourceDescription', ResourceDescription);

      _export('ModuleAnalyzer', ModuleAnalyzer = function () {
        function ModuleAnalyzer() {
          

          this.cache = Object.create(null);
        }

        ModuleAnalyzer.prototype.getAnalysis = function getAnalysis(moduleId) {
          return this.cache[moduleId];
        };

        ModuleAnalyzer.prototype.analyze = function analyze(moduleId, moduleInstance, mainResourceKey) {
          var mainResource = void 0;
          var fallbackValue = void 0;
          var fallbackKey = void 0;
          var resourceTypeMeta = void 0;
          var key = void 0;
          var exportedValue = void 0;
          var resources = [];
          var conventional = void 0;
          var vs = void 0;
          var resourceModule = void 0;

          resourceModule = this.cache[moduleId];
          if (resourceModule) {
            return resourceModule;
          }

          resourceModule = new ResourceModule(moduleId);
          this.cache[moduleId] = resourceModule;

          if (typeof moduleInstance === 'function') {
            moduleInstance = { 'default': moduleInstance };
          }

          if (mainResourceKey) {
            mainResource = new ResourceDescription(mainResourceKey, moduleInstance[mainResourceKey]);
          }

          for (key in moduleInstance) {
            exportedValue = moduleInstance[key];

            if (key === mainResourceKey || typeof exportedValue !== 'function') {
              continue;
            }

            resourceTypeMeta = metadata.get(metadata.resource, exportedValue);

            if (resourceTypeMeta) {
              if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
                HtmlBehaviorResource.convention(key, resourceTypeMeta);
              }

              if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
                resourceTypeMeta.elementName = _hyphenate(key);
              }

              if (!mainResource && resourceTypeMeta instanceof HtmlBehaviorResource && resourceTypeMeta.elementName !== null) {
                mainResource = new ResourceDescription(key, exportedValue, resourceTypeMeta);
              } else {
                resources.push(new ResourceDescription(key, exportedValue, resourceTypeMeta));
              }
            } else if (viewStrategy.decorates(exportedValue)) {
              vs = exportedValue;
            } else if (exportedValue instanceof TemplateRegistryEntry) {
              vs = new TemplateRegistryViewStrategy(moduleId, exportedValue);
            } else {
              if (conventional = HtmlBehaviorResource.convention(key)) {
                if (conventional.elementName !== null && !mainResource) {
                  mainResource = new ResourceDescription(key, exportedValue, conventional);
                } else {
                  resources.push(new ResourceDescription(key, exportedValue, conventional));
                }

                metadata.define(metadata.resource, conventional, exportedValue);
              } else if (conventional = ValueConverterResource.convention(key) || BindingBehaviorResource.convention(key) || ViewEngineHooksResource.convention(key)) {
                resources.push(new ResourceDescription(key, exportedValue, conventional));
                metadata.define(metadata.resource, conventional, exportedValue);
              } else if (!fallbackValue) {
                fallbackValue = exportedValue;
                fallbackKey = key;
              }
            }
          }

          if (!mainResource && fallbackValue) {
            mainResource = new ResourceDescription(fallbackKey, fallbackValue);
          }

          resourceModule.moduleInstance = moduleInstance;
          resourceModule.mainResource = mainResource;
          resourceModule.resources = resources;
          resourceModule.viewStrategy = vs;

          return resourceModule;
        };

        return ModuleAnalyzer;
      }());

      _export('ModuleAnalyzer', ModuleAnalyzer);

      logger = LogManager.getLogger('templating');

      ProxyViewFactory = function () {
        function ProxyViewFactory(promise) {
          var _this9 = this;

          

          promise.then(function (x) {
            return _this9.viewFactory = x;
          });
        }

        ProxyViewFactory.prototype.create = function create(container, bindingContext, createInstruction, element) {
          return this.viewFactory.create(container, bindingContext, createInstruction, element);
        };

        ProxyViewFactory.prototype.setCacheSize = function setCacheSize(size, doNotOverrideIfAlreadySet) {
          this.viewFactory.setCacheSize(size, doNotOverrideIfAlreadySet);
        };

        ProxyViewFactory.prototype.getCachedView = function getCachedView() {
          return this.viewFactory.getCachedView();
        };

        ProxyViewFactory.prototype.returnViewToCache = function returnViewToCache(view) {
          this.viewFactory.returnViewToCache(view);
        };

        _createClass(ProxyViewFactory, [{
          key: 'isCaching',
          get: function get() {
            return this.viewFactory.isCaching;
          }
        }]);

        return ProxyViewFactory;
      }();

      _export('ViewEngine', ViewEngine = (_dec8 = inject(Loader, Container, ViewCompiler, ModuleAnalyzer, ViewResources), _dec8(_class14 = (_temp4 = _class15 = function () {
        function ViewEngine(loader, container, viewCompiler, moduleAnalyzer, appResources) {
          

          this.loader = loader;
          this.container = container;
          this.viewCompiler = viewCompiler;
          this.moduleAnalyzer = moduleAnalyzer;
          this.appResources = appResources;
          this._pluginMap = {};

          var auSlotBehavior = new HtmlBehaviorResource();
          auSlotBehavior.attributeName = 'au-slot';
          auSlotBehavior.initialize(container, SlotCustomAttribute);
          auSlotBehavior.register(appResources);
        }

        ViewEngine.prototype.addResourcePlugin = function addResourcePlugin(extension, implementation) {
          var name = extension.replace('.', '') + '-resource-plugin';
          this._pluginMap[extension] = name;
          this.loader.addPlugin(name, implementation);
        };

        ViewEngine.prototype.loadViewFactory = function loadViewFactory(urlOrRegistryEntry, compileInstruction, loadContext, target) {
          var _this10 = this;

          loadContext = loadContext || new ResourceLoadContext();

          return ensureRegistryEntry(this.loader, urlOrRegistryEntry).then(function (registryEntry) {
            if (registryEntry.onReady) {
              if (!loadContext.hasDependency(urlOrRegistryEntry)) {
                loadContext.addDependency(urlOrRegistryEntry);
                return registryEntry.onReady;
              }

              if (registryEntry.template === null) {
                return registryEntry.onReady;
              }

              return Promise.resolve(new ProxyViewFactory(registryEntry.onReady));
            }

            loadContext.addDependency(urlOrRegistryEntry);

            registryEntry.onReady = _this10.loadTemplateResources(registryEntry, compileInstruction, loadContext, target).then(function (resources) {
              registryEntry.resources = resources;

              if (registryEntry.template === null) {
                return registryEntry.factory = null;
              }

              var viewFactory = _this10.viewCompiler.compile(registryEntry.template, resources, compileInstruction);
              return registryEntry.factory = viewFactory;
            });

            return registryEntry.onReady;
          });
        };

        ViewEngine.prototype.loadTemplateResources = function loadTemplateResources(registryEntry, compileInstruction, loadContext, target) {
          var resources = new ViewResources(this.appResources, registryEntry.address);
          var dependencies = registryEntry.dependencies;
          var importIds = void 0;
          var names = void 0;

          compileInstruction = compileInstruction || ViewCompileInstruction.normal;

          if (dependencies.length === 0 && !compileInstruction.associatedModuleId) {
            return Promise.resolve(resources);
          }

          importIds = dependencies.map(function (x) {
            return x.src;
          });
          names = dependencies.map(function (x) {
            return x.name;
          });
          logger.debug('importing resources for ' + registryEntry.address, importIds);

          if (target) {
            var viewModelRequires = metadata.get(ViewEngine.viewModelRequireMetadataKey, target);
            if (viewModelRequires) {
              var templateImportCount = importIds.length;
              for (var i = 0, ii = viewModelRequires.length; i < ii; ++i) {
                var req = viewModelRequires[i];
                var importId = typeof req === 'function' ? Origin.get(req).moduleId : relativeToFile(req.src || req, registryEntry.address);

                if (importIds.indexOf(importId) === -1) {
                  importIds.push(importId);
                  names.push(req.as);
                }
              }
              logger.debug('importing ViewModel resources for ' + compileInstruction.associatedModuleId, importIds.slice(templateImportCount));
            }
          }

          return this.importViewResources(importIds, names, resources, compileInstruction, loadContext);
        };

        ViewEngine.prototype.importViewModelResource = function importViewModelResource(moduleImport, moduleMember) {
          var _this11 = this;

          return this.loader.loadModule(moduleImport).then(function (viewModelModule) {
            var normalizedId = Origin.get(viewModelModule).moduleId;
            var resourceModule = _this11.moduleAnalyzer.analyze(normalizedId, viewModelModule, moduleMember);

            if (!resourceModule.mainResource) {
              throw new Error('No view model found in module "' + moduleImport + '".');
            }

            resourceModule.initialize(_this11.container);

            return resourceModule.mainResource;
          });
        };

        ViewEngine.prototype.importViewResources = function importViewResources(moduleIds, names, resources, compileInstruction, loadContext) {
          var _this12 = this;

          loadContext = loadContext || new ResourceLoadContext();
          compileInstruction = compileInstruction || ViewCompileInstruction.normal;

          moduleIds = moduleIds.map(function (x) {
            return _this12._applyLoaderPlugin(x);
          });

          return this.loader.loadAllModules(moduleIds).then(function (imports) {
            var i = void 0;
            var ii = void 0;
            var analysis = void 0;
            var normalizedId = void 0;
            var current = void 0;
            var associatedModule = void 0;
            var container = _this12.container;
            var moduleAnalyzer = _this12.moduleAnalyzer;
            var allAnalysis = new Array(imports.length);

            for (i = 0, ii = imports.length; i < ii; ++i) {
              current = imports[i];
              normalizedId = Origin.get(current).moduleId;

              analysis = moduleAnalyzer.analyze(normalizedId, current);
              analysis.initialize(container);
              analysis.register(resources, names[i]);

              allAnalysis[i] = analysis;
            }

            if (compileInstruction.associatedModuleId) {
              associatedModule = moduleAnalyzer.getAnalysis(compileInstruction.associatedModuleId);

              if (associatedModule) {
                associatedModule.register(resources);
              }
            }

            for (i = 0, ii = allAnalysis.length; i < ii; ++i) {
              allAnalysis[i] = allAnalysis[i].load(container, loadContext);
            }

            return Promise.all(allAnalysis).then(function () {
              return resources;
            });
          });
        };

        ViewEngine.prototype._applyLoaderPlugin = function _applyLoaderPlugin(id) {
          var index = id.lastIndexOf('.');
          if (index !== -1) {
            var ext = id.substring(index);
            var pluginName = this._pluginMap[ext];

            if (pluginName === undefined) {
              return id;
            }

            return this.loader.applyPluginToUrl(id, pluginName);
          }

          return id;
        };

        return ViewEngine;
      }(), _class15.viewModelRequireMetadataKey = 'aurelia:view-model-require', _temp4)) || _class14));

      _export('ViewEngine', ViewEngine);

      _export('Controller', Controller = function () {
        function Controller(behavior, instruction, viewModel, container) {
          

          this.behavior = behavior;
          this.instruction = instruction;
          this.viewModel = viewModel;
          this.isAttached = false;
          this.view = null;
          this.isBound = false;
          this.scope = null;
          this.container = container;
          this.elementEvents = container.elementEvents || null;

          var observerLookup = behavior.observerLocator.getOrCreateObserversLookup(viewModel);
          var handlesBind = behavior.handlesBind;
          var attributes = instruction.attributes;
          var boundProperties = this.boundProperties = [];
          var properties = behavior.properties;
          var i = void 0;
          var ii = void 0;

          behavior._ensurePropertiesDefined(viewModel, observerLookup);

          for (i = 0, ii = properties.length; i < ii; ++i) {
            properties[i]._initialize(viewModel, observerLookup, attributes, handlesBind, boundProperties);
          }
        }

        Controller.prototype.created = function created(owningView) {
          if (this.behavior.handlesCreated) {
            this.viewModel.created(owningView, this.view);
          }
        };

        Controller.prototype.automate = function automate(overrideContext, owningView) {
          this.view.bindingContext = this.viewModel;
          this.view.overrideContext = overrideContext || createOverrideContext(this.viewModel);
          this.view._isUserControlled = true;

          if (this.behavior.handlesCreated) {
            this.viewModel.created(owningView || null, this.view);
          }

          this.bind(this.view);
        };

        Controller.prototype.bind = function bind(scope) {
          var skipSelfSubscriber = this.behavior.handlesBind;
          var boundProperties = this.boundProperties;
          var i = void 0;
          var ii = void 0;
          var x = void 0;
          var observer = void 0;
          var selfSubscriber = void 0;

          if (this.isBound) {
            if (this.scope === scope) {
              return;
            }

            this.unbind();
          }

          this.isBound = true;
          this.scope = scope;

          for (i = 0, ii = boundProperties.length; i < ii; ++i) {
            x = boundProperties[i];
            observer = x.observer;
            selfSubscriber = observer.selfSubscriber;
            observer.publishing = false;

            if (skipSelfSubscriber) {
              observer.selfSubscriber = null;
            }

            x.binding.bind(scope);
            observer.call();

            observer.publishing = true;
            observer.selfSubscriber = selfSubscriber;
          }

          var overrideContext = void 0;
          if (this.view !== null) {
            if (skipSelfSubscriber) {
              this.view.viewModelScope = scope;
            }

            if (this.viewModel === scope.overrideContext.bindingContext) {
              overrideContext = scope.overrideContext;
            } else if (this.instruction.inheritBindingContext) {
              overrideContext = createOverrideContext(this.viewModel, scope.overrideContext);
            } else {
              overrideContext = createOverrideContext(this.viewModel);
              overrideContext.__parentOverrideContext = scope.overrideContext;
            }

            this.view.bind(this.viewModel, overrideContext);
          } else if (skipSelfSubscriber) {
            overrideContext = scope.overrideContext;

            if (scope.overrideContext.__parentOverrideContext !== undefined && this.viewModel.viewFactory && this.viewModel.viewFactory.factoryCreateInstruction.partReplacements) {
              overrideContext = Object.assign({}, scope.overrideContext);
              overrideContext.parentOverrideContext = scope.overrideContext.__parentOverrideContext;
            }
            this.viewModel.bind(scope.bindingContext, overrideContext);
          }
        };

        Controller.prototype.unbind = function unbind() {
          if (this.isBound) {
            var _boundProperties = this.boundProperties;
            var _i2 = void 0;
            var _ii2 = void 0;

            this.isBound = false;
            this.scope = null;

            if (this.view !== null) {
              this.view.unbind();
            }

            if (this.behavior.handlesUnbind) {
              this.viewModel.unbind();
            }

            if (this.elementEvents !== null) {
              this.elementEvents.disposeAll();
            }

            for (_i2 = 0, _ii2 = _boundProperties.length; _i2 < _ii2; ++_i2) {
              _boundProperties[_i2].binding.unbind();
            }
          }
        };

        Controller.prototype.attached = function attached() {
          if (this.isAttached) {
            return;
          }

          this.isAttached = true;

          if (this.behavior.handlesAttached) {
            this.viewModel.attached();
          }

          if (this.view !== null) {
            this.view.attached();
          }
        };

        Controller.prototype.detached = function detached() {
          if (this.isAttached) {
            this.isAttached = false;

            if (this.view !== null) {
              this.view.detached();
            }

            if (this.behavior.handlesDetached) {
              this.viewModel.detached();
            }
          }
        };

        return Controller;
      }());

      _export('Controller', Controller);

      _export('BehaviorPropertyObserver', BehaviorPropertyObserver = (_dec9 = subscriberCollection(), _dec9(_class16 = function () {
        function BehaviorPropertyObserver(taskQueue, obj, propertyName, selfSubscriber, initialValue) {
          

          this.taskQueue = taskQueue;
          this.obj = obj;
          this.propertyName = propertyName;
          this.notqueued = true;
          this.publishing = false;
          this.selfSubscriber = selfSubscriber;
          this.currentValue = this.oldValue = initialValue;
        }

        BehaviorPropertyObserver.prototype.getValue = function getValue() {
          return this.currentValue;
        };

        BehaviorPropertyObserver.prototype.setValue = function setValue(newValue) {
          var oldValue = this.currentValue;

          if (oldValue !== newValue) {
            this.oldValue = oldValue;
            this.currentValue = newValue;

            if (this.publishing && this.notqueued) {
              if (this.taskQueue.flushing) {
                this.call();
              } else {
                this.notqueued = false;
                this.taskQueue.queueMicroTask(this);
              }
            }
          }
        };

        BehaviorPropertyObserver.prototype.call = function call() {
          var oldValue = this.oldValue;
          var newValue = this.currentValue;

          this.notqueued = true;

          if (newValue === oldValue) {
            return;
          }

          if (this.selfSubscriber) {
            this.selfSubscriber(newValue, oldValue);
          }

          this.callSubscribers(newValue, oldValue);
          this.oldValue = newValue;
        };

        BehaviorPropertyObserver.prototype.subscribe = function subscribe(context, callable) {
          this.addSubscriber(context, callable);
        };

        BehaviorPropertyObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
          this.removeSubscriber(context, callable);
        };

        return BehaviorPropertyObserver;
      }()) || _class16));

      _export('BehaviorPropertyObserver', BehaviorPropertyObserver);

      _export('BindableProperty', BindableProperty = function () {
        function BindableProperty(nameOrConfig) {
          

          if (typeof nameOrConfig === 'string') {
            this.name = nameOrConfig;
          } else {
            Object.assign(this, nameOrConfig);
          }

          this.attribute = this.attribute || _hyphenate(this.name);
          if (this.defaultBindingMode === null || this.defaultBindingMode === undefined) {
            this.defaultBindingMode = bindingMode.oneWay;
          }
          this.changeHandler = this.changeHandler || null;
          this.owner = null;
          this.descriptor = null;
        }

        BindableProperty.prototype.registerWith = function registerWith(target, behavior, descriptor) {
          behavior.properties.push(this);
          behavior.attributes[this.attribute] = this;
          this.owner = behavior;

          if (descriptor) {
            this.descriptor = descriptor;
            return this._configureDescriptor(behavior, descriptor);
          }

          return undefined;
        };

        BindableProperty.prototype._configureDescriptor = function _configureDescriptor(behavior, descriptor) {
          var name = this.name;

          descriptor.configurable = true;
          descriptor.enumerable = true;

          if ('initializer' in descriptor) {
            this.defaultValue = descriptor.initializer;
            delete descriptor.initializer;
            delete descriptor.writable;
          }

          if ('value' in descriptor) {
            this.defaultValue = descriptor.value;
            delete descriptor.value;
            delete descriptor.writable;
          }

          descriptor.get = function () {
            return getObserver(behavior, this, name).getValue();
          };

          descriptor.set = function (value) {
            getObserver(behavior, this, name).setValue(value);
          };

          descriptor.get.getObserver = function (obj) {
            return getObserver(behavior, obj, name);
          };

          return descriptor;
        };

        BindableProperty.prototype.defineOn = function defineOn(target, behavior) {
          var name = this.name;
          var handlerName = void 0;

          if (this.changeHandler === null) {
            handlerName = name + 'Changed';
            if (handlerName in target.prototype) {
              this.changeHandler = handlerName;
            }
          }

          if (this.descriptor === null) {
            Object.defineProperty(target.prototype, name, this._configureDescriptor(behavior, {}));
          }
        };

        BindableProperty.prototype.createObserver = function createObserver(viewModel) {
          var selfSubscriber = null;
          var defaultValue = this.defaultValue;
          var changeHandlerName = this.changeHandler;
          var name = this.name;
          var initialValue = void 0;

          if (this.hasOptions) {
            return undefined;
          }

          if (changeHandlerName in viewModel) {
            if ('propertyChanged' in viewModel) {
              selfSubscriber = function selfSubscriber(newValue, oldValue) {
                viewModel[changeHandlerName](newValue, oldValue);
                viewModel.propertyChanged(name, newValue, oldValue);
              };
            } else {
              selfSubscriber = function selfSubscriber(newValue, oldValue) {
                return viewModel[changeHandlerName](newValue, oldValue);
              };
            }
          } else if ('propertyChanged' in viewModel) {
            selfSubscriber = function selfSubscriber(newValue, oldValue) {
              return viewModel.propertyChanged(name, newValue, oldValue);
            };
          } else if (changeHandlerName !== null) {
            throw new Error('Change handler ' + changeHandlerName + ' was specified but not declared on the class.');
          }

          if (defaultValue !== undefined) {
            initialValue = typeof defaultValue === 'function' ? defaultValue.call(viewModel) : defaultValue;
          }

          return new BehaviorPropertyObserver(this.owner.taskQueue, viewModel, this.name, selfSubscriber, initialValue);
        };

        BindableProperty.prototype._initialize = function _initialize(viewModel, observerLookup, attributes, behaviorHandlesBind, boundProperties) {
          var selfSubscriber = void 0;
          var observer = void 0;
          var attribute = void 0;
          var defaultValue = this.defaultValue;

          if (this.isDynamic) {
            for (var key in attributes) {
              this._createDynamicProperty(viewModel, observerLookup, behaviorHandlesBind, key, attributes[key], boundProperties);
            }
          } else if (!this.hasOptions) {
            observer = observerLookup[this.name];

            if (attributes !== null) {
              selfSubscriber = observer.selfSubscriber;
              attribute = attributes[this.attribute];

              if (behaviorHandlesBind) {
                observer.selfSubscriber = null;
              }

              if (typeof attribute === 'string') {
                viewModel[this.name] = attribute;
                observer.call();
              } else if (attribute) {
                boundProperties.push({ observer: observer, binding: attribute.createBinding(viewModel) });
              } else if (defaultValue !== undefined) {
                observer.call();
              }

              observer.selfSubscriber = selfSubscriber;
            }

            observer.publishing = true;
          }
        };

        BindableProperty.prototype._createDynamicProperty = function _createDynamicProperty(viewModel, observerLookup, behaviorHandlesBind, name, attribute, boundProperties) {
          var changeHandlerName = name + 'Changed';
          var selfSubscriber = null;
          var observer = void 0;
          var info = void 0;

          if (changeHandlerName in viewModel) {
            if ('propertyChanged' in viewModel) {
              selfSubscriber = function selfSubscriber(newValue, oldValue) {
                viewModel[changeHandlerName](newValue, oldValue);
                viewModel.propertyChanged(name, newValue, oldValue);
              };
            } else {
              selfSubscriber = function selfSubscriber(newValue, oldValue) {
                return viewModel[changeHandlerName](newValue, oldValue);
              };
            }
          } else if ('propertyChanged' in viewModel) {
            selfSubscriber = function selfSubscriber(newValue, oldValue) {
              return viewModel.propertyChanged(name, newValue, oldValue);
            };
          }

          observer = observerLookup[name] = new BehaviorPropertyObserver(this.owner.taskQueue, viewModel, name, selfSubscriber);

          Object.defineProperty(viewModel, name, {
            configurable: true,
            enumerable: true,
            get: observer.getValue.bind(observer),
            set: observer.setValue.bind(observer)
          });

          if (behaviorHandlesBind) {
            observer.selfSubscriber = null;
          }

          if (typeof attribute === 'string') {
            viewModel[name] = attribute;
            observer.call();
          } else if (attribute) {
            info = { observer: observer, binding: attribute.createBinding(viewModel) };
            boundProperties.push(info);
          }

          observer.publishing = true;
          observer.selfSubscriber = selfSubscriber;
        };

        return BindableProperty;
      }());

      _export('BindableProperty', BindableProperty);

      lastProviderId = 0;

      _export('HtmlBehaviorResource', HtmlBehaviorResource = function () {
        function HtmlBehaviorResource() {
          

          this.elementName = null;
          this.attributeName = null;
          this.attributeDefaultBindingMode = undefined;
          this.liftsContent = false;
          this.targetShadowDOM = false;
          this.shadowDOMOptions = null;
          this.processAttributes = doProcessAttributes;
          this.processContent = doProcessContent;
          this.usesShadowDOM = false;
          this.childBindings = null;
          this.hasDynamicOptions = false;
          this.containerless = false;
          this.properties = [];
          this.attributes = {};
          this.aliases = [];
          this.isInitialized = false;
          this.primaryProperty = null;
        }

        HtmlBehaviorResource.convention = function convention(name, existing) {
          var behavior = void 0;

          if (name.endsWith('CustomAttribute')) {
            behavior = existing || new HtmlBehaviorResource();
            behavior.attributeName = _hyphenate(name.substring(0, name.length - 15));
          }

          if (name.endsWith('CustomElement')) {
            behavior = existing || new HtmlBehaviorResource();
            behavior.elementName = _hyphenate(name.substring(0, name.length - 13));
          }

          return behavior;
        };

        HtmlBehaviorResource.prototype.addChildBinding = function addChildBinding(behavior) {
          if (this.childBindings === null) {
            this.childBindings = [];
          }

          this.childBindings.push(behavior);
        };

        HtmlBehaviorResource.prototype.initialize = function initialize(container, target) {
          var proto = target.prototype;
          var properties = this.properties;
          var attributeName = this.attributeName;
          var attributeDefaultBindingMode = this.attributeDefaultBindingMode;
          var i = void 0;
          var ii = void 0;
          var current = void 0;

          if (this.isInitialized) {
            return;
          }

          this.isInitialized = true;
          target.__providerId__ = nextProviderId();

          this.observerLocator = container.get(ObserverLocator);
          this.taskQueue = container.get(TaskQueue);

          this.target = target;
          this.usesShadowDOM = this.targetShadowDOM && FEATURE.shadowDOM;
          this.handlesCreated = 'created' in proto;
          this.handlesBind = 'bind' in proto;
          this.handlesUnbind = 'unbind' in proto;
          this.handlesAttached = 'attached' in proto;
          this.handlesDetached = 'detached' in proto;
          this.htmlName = this.elementName || this.attributeName;

          if (attributeName !== null) {
            if (properties.length === 0) {
              new BindableProperty({
                name: 'value',
                changeHandler: 'valueChanged' in proto ? 'valueChanged' : null,
                attribute: attributeName,
                defaultBindingMode: attributeDefaultBindingMode
              }).registerWith(target, this);
            }

            current = properties[0];

            if (properties.length === 1 && current.name === 'value') {
              current.isDynamic = current.hasOptions = this.hasDynamicOptions;
              current.defineOn(target, this);
            } else {
              for (i = 0, ii = properties.length; i < ii; ++i) {
                properties[i].defineOn(target, this);
                if (properties[i].primaryProperty) {
                  if (this.primaryProperty) {
                    throw new Error('Only one bindable property on a custom element can be defined as the default');
                  }
                  this.primaryProperty = properties[i];
                }
              }

              current = new BindableProperty({
                name: 'value',
                changeHandler: 'valueChanged' in proto ? 'valueChanged' : null,
                attribute: attributeName,
                defaultBindingMode: attributeDefaultBindingMode
              });

              current.hasOptions = true;
              current.registerWith(target, this);
            }
          } else {
            for (i = 0, ii = properties.length; i < ii; ++i) {
              properties[i].defineOn(target, this);
            }
          }
        };

        HtmlBehaviorResource.prototype.register = function register(registry, name) {
          if (this.attributeName !== null) {
            registry.registerAttribute(name || this.attributeName, this, this.attributeName);
          }

          if (this.elementName !== null) {
            registry.registerElement(name || this.elementName, this);
          }
        };

        HtmlBehaviorResource.prototype.load = function load(container, target, loadContext, viewStrategy, transientView) {
          var _this13 = this;

          var options = void 0;

          if (this.elementName !== null) {
            viewStrategy = container.get(ViewLocator).getViewStrategy(viewStrategy || this.viewStrategy || target);
            options = new ViewCompileInstruction(this.targetShadowDOM, true);

            if (!viewStrategy.moduleId) {
              viewStrategy.moduleId = Origin.get(target).moduleId;
            }

            return viewStrategy.loadViewFactory(container.get(ViewEngine), options, loadContext, target).then(function (viewFactory) {
              if (!transientView || !_this13.viewFactory) {
                _this13.viewFactory = viewFactory;
              }

              return viewFactory;
            });
          }

          return Promise.resolve(this);
        };

        HtmlBehaviorResource.prototype.compile = function compile(compiler, resources, node, instruction, parentNode) {
          if (this.liftsContent) {
            if (!instruction.viewFactory) {
              var template = DOM.createElement('template');
              var fragment = DOM.createDocumentFragment();
              var cacheSize = node.getAttribute('view-cache');
              var part = node.getAttribute('part');

              node.removeAttribute(instruction.originalAttrName);
              DOM.replaceNode(template, node, parentNode);
              fragment.appendChild(node);
              instruction.viewFactory = compiler.compile(fragment, resources);

              if (part) {
                instruction.viewFactory.part = part;
                node.removeAttribute('part');
              }

              if (cacheSize) {
                instruction.viewFactory.setCacheSize(cacheSize);
                node.removeAttribute('view-cache');
              }

              node = template;
            }
          } else if (this.elementName !== null) {
            var _partReplacements2 = {};

            if (this.processContent(compiler, resources, node, instruction) && node.hasChildNodes()) {
              var currentChild = node.firstChild;
              var contentElement = this.usesShadowDOM ? null : DOM.createElement('au-content');
              var nextSibling = void 0;
              var toReplace = void 0;

              while (currentChild) {
                nextSibling = currentChild.nextSibling;

                if (currentChild.tagName === 'TEMPLATE' && (toReplace = currentChild.getAttribute('replace-part'))) {
                  _partReplacements2[toReplace] = compiler.compile(currentChild, resources);
                  DOM.removeNode(currentChild, parentNode);
                  instruction.partReplacements = _partReplacements2;
                } else if (contentElement !== null) {
                  if (currentChild.nodeType === 3 && _isAllWhitespace(currentChild)) {
                    DOM.removeNode(currentChild, parentNode);
                  } else {
                    contentElement.appendChild(currentChild);
                  }
                }

                currentChild = nextSibling;
              }

              if (contentElement !== null && contentElement.hasChildNodes()) {
                node.appendChild(contentElement);
              }

              instruction.skipContentProcessing = false;
            } else {
              instruction.skipContentProcessing = true;
            }
          }

          return node;
        };

        HtmlBehaviorResource.prototype.create = function create(container, instruction, element, bindings) {
          var viewHost = void 0;
          var au = null;

          instruction = instruction || BehaviorInstruction.normal;
          element = element || null;
          bindings = bindings || null;

          if (this.elementName !== null && element) {
            if (this.usesShadowDOM) {
              viewHost = element.attachShadow(this.shadowDOMOptions);
              container.registerInstance(DOM.boundary, viewHost);
            } else {
              viewHost = element;
              if (this.targetShadowDOM) {
                container.registerInstance(DOM.boundary, viewHost);
              }
            }
          }

          if (element !== null) {
            element.au = au = element.au || {};
          }

          var viewModel = instruction.viewModel || container.get(this.target);
          var controller = new Controller(this, instruction, viewModel, container);
          var childBindings = this.childBindings;
          var viewFactory = void 0;

          if (this.liftsContent) {
            au.controller = controller;
          } else if (this.elementName !== null) {
            viewFactory = instruction.viewFactory || this.viewFactory;
            container.viewModel = viewModel;

            if (viewFactory) {
              controller.view = viewFactory.create(container, instruction, element);
            }

            if (element !== null) {
              au.controller = controller;

              if (controller.view) {
                if (!this.usesShadowDOM && (element.childNodes.length === 1 || element.contentElement)) {
                  var contentElement = element.childNodes[0] || element.contentElement;
                  controller.view.contentView = { fragment: contentElement };
                  contentElement.parentNode && DOM.removeNode(contentElement);
                }

                if (instruction.anchorIsContainer) {
                  if (childBindings !== null) {
                    for (var _i3 = 0, _ii3 = childBindings.length; _i3 < _ii3; ++_i3) {
                      controller.view.addBinding(childBindings[_i3].create(element, viewModel, controller));
                    }
                  }

                  controller.view.appendNodesTo(viewHost);
                } else {
                  controller.view.insertNodesBefore(viewHost);
                }
              } else if (childBindings !== null) {
                for (var _i4 = 0, _ii4 = childBindings.length; _i4 < _ii4; ++_i4) {
                  bindings.push(childBindings[_i4].create(element, viewModel, controller));
                }
              }
            } else if (controller.view) {
              controller.view.controller = controller;

              if (childBindings !== null) {
                for (var _i5 = 0, _ii5 = childBindings.length; _i5 < _ii5; ++_i5) {
                  controller.view.addBinding(childBindings[_i5].create(instruction.host, viewModel, controller));
                }
              }
            } else if (childBindings !== null) {
              for (var _i6 = 0, _ii6 = childBindings.length; _i6 < _ii6; ++_i6) {
                bindings.push(childBindings[_i6].create(instruction.host, viewModel, controller));
              }
            }
          } else if (childBindings !== null) {
            for (var _i7 = 0, _ii7 = childBindings.length; _i7 < _ii7; ++_i7) {
              bindings.push(childBindings[_i7].create(element, viewModel, controller));
            }
          }

          if (au !== null) {
            au[this.htmlName] = controller;
          }

          if (instruction.initiatedByBehavior && viewFactory) {
            controller.view.created();
          }

          return controller;
        };

        HtmlBehaviorResource.prototype._ensurePropertiesDefined = function _ensurePropertiesDefined(instance, lookup) {
          var properties = void 0;
          var i = void 0;
          var ii = void 0;
          var observer = void 0;

          if ('__propertiesDefined__' in lookup) {
            return;
          }

          lookup.__propertiesDefined__ = true;
          properties = this.properties;

          for (i = 0, ii = properties.length; i < ii; ++i) {
            observer = properties[i].createObserver(instance);

            if (observer !== undefined) {
              lookup[observer.propertyName] = observer;
            }
          }
        };

        return HtmlBehaviorResource;
      }());

      _export('HtmlBehaviorResource', HtmlBehaviorResource);

      ChildObserver = function () {
        function ChildObserver(config) {
          

          this.name = config.name;
          this.changeHandler = config.changeHandler || this.name + 'Changed';
          this.selector = config.selector;
          this.all = config.all;
        }

        ChildObserver.prototype.create = function create(viewHost, viewModel, controller) {
          return new ChildObserverBinder(this.selector, viewHost, this.name, viewModel, controller, this.changeHandler, this.all);
        };

        return ChildObserver;
      }();

      noMutations = [];

      ChildObserverBinder = function () {
        function ChildObserverBinder(selector, viewHost, property, viewModel, controller, changeHandler, all) {
          

          this.selector = selector;
          this.viewHost = viewHost;
          this.property = property;
          this.viewModel = viewModel;
          this.controller = controller;
          this.changeHandler = changeHandler in viewModel ? changeHandler : null;
          this.usesShadowDOM = controller.behavior.usesShadowDOM;
          this.all = all;

          if (!this.usesShadowDOM && controller.view && controller.view.contentView) {
            this.contentView = controller.view.contentView;
          } else {
            this.contentView = null;
          }
        }

        ChildObserverBinder.prototype.matches = function matches(element) {
          if (element.matches(this.selector)) {
            if (this.contentView === null) {
              return true;
            }

            var contentView = this.contentView;
            var assignedSlot = element.auAssignedSlot;

            if (assignedSlot && assignedSlot.projectFromAnchors) {
              var anchors = assignedSlot.projectFromAnchors;

              for (var _i9 = 0, _ii9 = anchors.length; _i9 < _ii9; ++_i9) {
                if (anchors[_i9].auOwnerView === contentView) {
                  return true;
                }
              }

              return false;
            }

            return element.auOwnerView === contentView;
          }

          return false;
        };

        ChildObserverBinder.prototype.bind = function bind(source) {
          var viewHost = this.viewHost;
          var viewModel = this.viewModel;
          var observer = viewHost.__childObserver__;

          if (!observer) {
            observer = viewHost.__childObserver__ = DOM.createMutationObserver(onChildChange);

            var options = {
              childList: true,
              subtree: !this.usesShadowDOM
            };

            observer.observe(viewHost, options);
            observer.binders = [];
          }

          observer.binders.push(this);

          if (this.usesShadowDOM) {
            var current = viewHost.firstElementChild;

            if (this.all) {
              var items = viewModel[this.property];
              if (!items) {
                items = viewModel[this.property] = [];
              } else {
                items.length = 0;
              }

              while (current) {
                if (this.matches(current)) {
                  items.push(current.au && current.au.controller ? current.au.controller.viewModel : current);
                }

                current = current.nextElementSibling;
              }

              if (this.changeHandler !== null) {
                this.viewModel[this.changeHandler](noMutations);
              }
            } else {
              while (current) {
                if (this.matches(current)) {
                  var value = current.au && current.au.controller ? current.au.controller.viewModel : current;
                  this.viewModel[this.property] = value;

                  if (this.changeHandler !== null) {
                    this.viewModel[this.changeHandler](value);
                  }

                  break;
                }

                current = current.nextElementSibling;
              }
            }
          }
        };

        ChildObserverBinder.prototype.onRemove = function onRemove(element) {
          if (this.matches(element)) {
            var value = element.au && element.au.controller ? element.au.controller.viewModel : element;

            if (this.all) {
              var items = this.viewModel[this.property] || (this.viewModel[this.property] = []);
              var index = items.indexOf(value);

              if (index !== -1) {
                items.splice(index, 1);
              }

              return true;
            }

            return false;
          }

          return false;
        };

        ChildObserverBinder.prototype.onAdd = function onAdd(element) {
          if (this.matches(element)) {
            var value = element.au && element.au.controller ? element.au.controller.viewModel : element;

            if (this.all) {
              var items = this.viewModel[this.property] || (this.viewModel[this.property] = []);
              var index = 0;
              var prev = element.previousElementSibling;

              while (prev) {
                if (this.matches(prev)) {
                  index++;
                }

                prev = prev.previousElementSibling;
              }

              items.splice(index, 0, value);
              return true;
            }

            this.viewModel[this.property] = value;

            if (this.changeHandler !== null) {
              this.viewModel[this.changeHandler](value);
            }
          }

          return false;
        };

        ChildObserverBinder.prototype.unbind = function unbind() {
          if (this.viewHost.__childObserver__) {
            this.viewHost.__childObserver__.disconnect();
            this.viewHost.__childObserver__ = null;
          }
        };

        return ChildObserverBinder;
      }();

      _export('SwapStrategies', SwapStrategies = {
        before: function before(viewSlot, previous, callback) {
          return previous === undefined ? callback() : callback().then(function () {
            return remove(viewSlot, previous);
          });
        },
        with: function _with(viewSlot, previous, callback) {
          return previous === undefined ? callback() : Promise.all([remove(viewSlot, previous), callback()]);
        },
        after: function after(viewSlot, previous, callback) {
          return Promise.resolve(viewSlot.removeAll(true)).then(callback);
        }
      });

      _export('SwapStrategies', SwapStrategies);

      _export('CompositionEngine', CompositionEngine = (_dec10 = inject(ViewEngine, ViewLocator), _dec10(_class17 = function () {
        function CompositionEngine(viewEngine, viewLocator) {
          

          this.viewEngine = viewEngine;
          this.viewLocator = viewLocator;
        }

        CompositionEngine.prototype._swap = function _swap(context, view) {
          var swapStrategy = SwapStrategies[context.swapOrder] || SwapStrategies.after;
          var previousViews = context.viewSlot.children.slice();

          return swapStrategy(context.viewSlot, previousViews, function () {
            return Promise.resolve(context.viewSlot.add(view)).then(function () {
              if (context.currentController) {
                context.currentController.unbind();
              }
            });
          }).then(function () {
            if (context.compositionTransactionNotifier) {
              context.compositionTransactionNotifier.done();
            }
          });
        };

        CompositionEngine.prototype._createControllerAndSwap = function _createControllerAndSwap(context) {
          var _this14 = this;

          return this.createController(context).then(function (controller) {
            controller.automate(context.overrideContext, context.owningView);

            if (context.compositionTransactionOwnershipToken) {
              return context.compositionTransactionOwnershipToken.waitForCompositionComplete().then(function () {
                return _this14._swap(context, controller.view);
              }).then(function () {
                return controller;
              });
            }

            return _this14._swap(context, controller.view).then(function () {
              return controller;
            });
          });
        };

        CompositionEngine.prototype.createController = function createController(context) {
          var _this15 = this;

          var childContainer = void 0;
          var viewModel = void 0;
          var viewModelResource = void 0;
          var m = void 0;

          return this.ensureViewModel(context).then(tryActivateViewModel).then(function () {
            childContainer = context.childContainer;
            viewModel = context.viewModel;
            viewModelResource = context.viewModelResource;
            m = viewModelResource.metadata;

            var viewStrategy = _this15.viewLocator.getViewStrategy(context.view || viewModel);

            if (context.viewResources) {
              viewStrategy.makeRelativeTo(context.viewResources.viewUrl);
            }

            return m.load(childContainer, viewModelResource.value, null, viewStrategy, true);
          }).then(function (viewFactory) {
            return m.create(childContainer, BehaviorInstruction.dynamic(context.host, viewModel, viewFactory));
          });
        };

        CompositionEngine.prototype.ensureViewModel = function ensureViewModel(context) {
          var childContainer = context.childContainer = context.childContainer || context.container.createChild();

          if (typeof context.viewModel === 'string') {
            context.viewModel = context.viewResources ? context.viewResources.relativeToView(context.viewModel) : context.viewModel;

            return this.viewEngine.importViewModelResource(context.viewModel).then(function (viewModelResource) {
              childContainer.autoRegister(viewModelResource.value);

              if (context.host) {
                childContainer.registerInstance(DOM.Element, context.host);
              }

              context.viewModel = childContainer.viewModel = childContainer.get(viewModelResource.value);
              context.viewModelResource = viewModelResource;
              return context;
            });
          }

          var m = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, context.viewModel.constructor);
          m.elementName = m.elementName || 'dynamic-element';
          m.initialize(context.container || childContainer, context.viewModel.constructor);
          context.viewModelResource = { metadata: m, value: context.viewModel.constructor };
          childContainer.viewModel = context.viewModel;
          return Promise.resolve(context);
        };

        CompositionEngine.prototype.compose = function compose(context) {
          var _this16 = this;

          context.childContainer = context.childContainer || context.container.createChild();
          context.view = this.viewLocator.getViewStrategy(context.view);

          var transaction = context.childContainer.get(CompositionTransaction);
          var compositionTransactionOwnershipToken = transaction.tryCapture();

          if (compositionTransactionOwnershipToken) {
            context.compositionTransactionOwnershipToken = compositionTransactionOwnershipToken;
          } else {
            context.compositionTransactionNotifier = transaction.enlist();
          }

          if (context.viewModel) {
            return this._createControllerAndSwap(context);
          } else if (context.view) {
            if (context.viewResources) {
              context.view.makeRelativeTo(context.viewResources.viewUrl);
            }

            return context.view.loadViewFactory(this.viewEngine, new ViewCompileInstruction()).then(function (viewFactory) {
              var result = viewFactory.create(context.childContainer);
              result.bind(context.bindingContext, context.overrideContext);

              if (context.compositionTransactionOwnershipToken) {
                return context.compositionTransactionOwnershipToken.waitForCompositionComplete().then(function () {
                  return _this16._swap(context, result);
                }).then(function () {
                  return result;
                });
              }

              return _this16._swap(context, result).then(function () {
                return result;
              });
            });
          } else if (context.viewSlot) {
            context.viewSlot.removeAll();

            if (context.compositionTransactionNotifier) {
              context.compositionTransactionNotifier.done();
            }

            return Promise.resolve(null);
          }

          return Promise.resolve(null);
        };

        return CompositionEngine;
      }()) || _class17));

      _export('CompositionEngine', CompositionEngine);

      _export('ElementConfigResource', ElementConfigResource = function () {
        function ElementConfigResource() {
          
        }

        ElementConfigResource.prototype.initialize = function initialize(container, target) {};

        ElementConfigResource.prototype.register = function register(registry, name) {};

        ElementConfigResource.prototype.load = function load(container, target) {
          var config = new target();
          var eventManager = container.get(EventManager);
          eventManager.registerElementConfig(config);
        };

        return ElementConfigResource;
      }());

      _export('ElementConfigResource', ElementConfigResource);

      defaultShadowDOMOptions = { mode: 'open' };

      _export('TemplatingEngine', TemplatingEngine = (_dec11 = inject(Container, ModuleAnalyzer, ViewCompiler, CompositionEngine), _dec11(_class18 = function () {
        function TemplatingEngine(container, moduleAnalyzer, viewCompiler, compositionEngine) {
          

          this._container = container;
          this._moduleAnalyzer = moduleAnalyzer;
          this._viewCompiler = viewCompiler;
          this._compositionEngine = compositionEngine;
          container.registerInstance(Animator, Animator.instance = new Animator());
        }

        TemplatingEngine.prototype.configureAnimator = function configureAnimator(animator) {
          this._container.unregister(Animator);
          this._container.registerInstance(Animator, Animator.instance = animator);
        };

        TemplatingEngine.prototype.compose = function compose(context) {
          return this._compositionEngine.compose(context);
        };

        TemplatingEngine.prototype.enhance = function enhance(instruction) {
          if (instruction instanceof DOM.Element) {
            instruction = { element: instruction };
          }

          var compilerInstructions = {};
          var resources = instruction.resources || this._container.get(ViewResources);

          this._viewCompiler._compileNode(instruction.element, resources, compilerInstructions, instruction.element.parentNode, 'root', true);

          var factory = new ViewFactory(instruction.element, compilerInstructions, resources);
          var container = instruction.container || this._container.createChild();
          var view = factory.create(container, BehaviorInstruction.enhance());

          view.bind(instruction.bindingContext || {}, instruction.overrideContext);

          return view;
        };

        return TemplatingEngine;
      }()) || _class18));

      _export('TemplatingEngine', TemplatingEngine);
    }
  };
});