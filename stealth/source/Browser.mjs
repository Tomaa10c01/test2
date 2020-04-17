
import { console, isFunction, isObject, isString } from './BASE.mjs';
import { Emitter                                 } from './Emitter.mjs';
import { Client                                  } from './Client.mjs';
import { Tab                                     } from './Tab.mjs';
import { URL                                     } from './parser/URL.mjs';



const Browser = function(settings) {

	this._settings = Object.freeze(Object.assign({
		debug: false,
		host:  'localhost'
	}, settings));

	this.client   = new Client(this);
	this.settings = {
		internet: { connection: 'mobile' },
		filters:  [],
		hosts:    [],
		modes:    [],
		peers:    []
	};
	this.tab      = null;
	this.tabs     = [];

	this.__state = {
		connected: false
	};


	Emitter.call(this);


	this.on('connect', () => {

		this.client.services.settings.read(null, () => {

			if (this._settings.debug === true) {
				console.info('Browser Settings loaded from "' + this._settings.host + '".');
			}

		});

	});

	this.on('disconnect', () => {

	});

};


Browser.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Browser',

	back: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			let result = this.tab.back();
			if (result === true) {

				this.emit('refresh', [ this.tab, this.tabs, false ]);

				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	connect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.__state.connected === false) {

			let host = isString(this._settings.host) ? this._settings.host : 'localhost';

			this.client.connect(host, (result) => {

				if (result === true) {

					this.__state.connected = true;
					this.emit('connect');

				} else {

					this.__state.connected = false;
					this.emit('disconnect');

				}

				if (callback !== null) {
					callback(result);
				}

			});

			if (callback !== null) {
				// Do nothing
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	disconnect: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.__state.connected === true) {

			this.client.disconnect(() => {

				this.__state.connected = false;
				this.emit('disconnect');

				if (callback !== null) {
					callback(true);
				}

			});

			if (callback !== null) {
				// Do nothing
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	download: function(url, callback) {

		url      = URL.isURL(URL.parse(url)) ? url      : null;
		callback = isFunction(callback)      ? callback : null;


		if (url !== null) {

			if (this.__state.connected === true) {

				this.client.services.session.request(URL.parse(url), (response) => {

					if (callback !== null) {
						callback(response);
					}

				});

				if (callback !== null) {
					// Do nothing
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(null);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return false;
			}

		}

	},

	execute: function(code, callback) {

		code     = isFunction(code)     ? code     : null;
		callback = isFunction(callback) ? callback : null;


		if (code !== null) {

			this.emit('execute', [ code, (result) => {

				if (callback !== null) {
					callback(result);
				}

			}]);

			if (callback !== null) {
				// Do nothing
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	get: function(url, callback) {

		url      = isString(url)        ? url      : null;
		callback = isFunction(callback) ? callback : null;


		let config = {
			domain: null,
			mode:   {
				text:  false,
				image: false,
				audio: false,
				video: false,
				other: false
			}
		};

		if (url !== null) {

			let ref    = URL.parse(url);
			let domain = ref.domain || null;
			if (domain !== null) {

				let subdomain = ref.subdomain || null;
				if (subdomain !== null) {
					domain = subdomain + '.' + domain;
				}

			}

			let rprotocol = ref.protocol || null;
			if (rprotocol === 'stealth') {

				config.mode.text  = true;
				config.mode.image = true;
				config.mode.audio = true;
				config.mode.video = true;
				config.mode.other = true;

			} else if (domain !== null) {

				let modes = this.settings.modes.filter((m) => domain.endsWith(m.domain));
				if (modes.length > 1) {

					return modes.sort((a, b) => {
						if (a.domain.length > b.domain.length) return -1;
						if (b.domain.length > a.domain.length) return  1;
						return 0;
					})[0];

				} else if (modes.length === 1) {

					return modes[0];

				}

			}

		}


		if (callback !== null) {
			callback(config);
		} else {
			return config;
		}

	},

	kill: function(tab, callback) {

		tab      = tab instanceof Tab   ? tab      : null;
		callback = isFunction(callback) ? callback : null;


		if (tab !== null) {

			if (this.tabs.includes(tab) === true) {

				this.tabs.splice(this.tabs.indexOf(tab), 1);

				if (isFunction(tab.kill) === true) {
					tab.kill();
				}

			}

			this.emit('kill', [ tab, this.tabs ]);


			if (this.tabs.length > 0) {

				this.tab = null;
				this.show(this.tabs[this.tabs.length - 1]);

			} else if (this.tabs.length === 0) {

				this.tab = null;

				let welcome = this.open('stealth:welcome');
				if (welcome !== null) {
					this.show(welcome);
				}

			}


			if (callback !== null) {
				callback(true);
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	navigate: function(url, callback) {

		url      = isString(url)        ? url      : null;
		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			let result = this.tab.navigate(url);
			if (result === true) {

				this.refresh();

				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (url.startsWith('./') || url.startsWith('../')) {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			} else {

				let tab = this.open(url);
				if (tab !== null) {

					let result = tab.navigate(url);
					if (result === true) {

						this.show(tab);

						if (callback !== null) {
							callback(true);
						} else {
							return true;
						}

					} else {

						if (callback !== null) {
							callback(false);
						} else {
							return false;
						}

					}

				} else {

					if (callback !== null) {
						callback(false);
					} else {
						return false;
					}

				}

			}

		}

	},

	next: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			let result = this.tab.next();
			if (result === true) {

				this.emit('refresh', [ this.tab, this.tabs, false ]);

				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}
		}

	},

	open: function(url, callback) {

		url      = isString(url)        ? url      : null;
		callback = isFunction(callback) ? callback : null;


		if (url !== null) {

			let ref = URL.parse(url);
			let tab = this.tabs.find((t) => t.url === ref.url) || null;
			if (tab !== null) {

				if (callback !== null) {
					callback(tab);
				} else {
					return tab;
				}

			} else {

				tab = new Tab({
					config: this.get(ref.url),
					ref:    ref,
					url:    ref.url
				});

				this.tabs.push(tab);
				this.emit('open', [ tab, this.tabs ]);


				if (callback !== null) {
					callback(tab);
				} else {
					return tab;
				}

			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	},

	pause: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			let result = this.tab.pause();
			if (result === true) {

				this.emit('pause', [ this.tab, this.tabs, true ]);

				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	refresh: function(callback) {

		callback = isFunction(callback) ? callback : null;


		if (this.tab !== null) {

			this.emit('refresh', [ this.tab, this.tabs, true ]);

			if (callback !== null) {
				callback(true);
			} else {
				return true;
			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	set: function(config, callback) {

		config   = isObject(config)     ? config   : null;
		callback = isFunction(callback) ? callback : null;


		if (config !== null && isObject(config.mode) === true) {

			let domain = config.domain || null;
			if (domain !== null) {

				let tmp1 = this.get(domain);
				let tmp2 = {
					domain: config.domain,
					mode:   {
						text:  false,
						image: false,
						audio: false,
						video: false,
						other: false
					}
				};

				Object.keys(config.mode).forEach((type) => {
					tmp2.mode[type] = config.mode[type] === true;
				});


				config = null;

				if (tmp1.domain === null) {

					config = tmp2;
					this.settings.modes.push(config);
					this.client.services.mode.save(config, () => {});

				} else if (tmp1.domain === tmp2.domain) {

					config = tmp1;

					let diff = false;

					Object.keys(tmp1.mode).forEach((type) => {
						if (tmp1.mode[type] !== tmp2.mode[type]) {
							tmp1.mode[type] = tmp2.mode[type];
							diff = true;
						}
					});

					if (diff === true) {
						this.client.services.mode.save(tmp1, () => {});
					}

				} else if (tmp1.domain !== tmp2.domain) {

					config = tmp2;
					this.settings.modes.push(config);
					this.client.services.mode.save(config, () => {});

				}


				if (config !== null) {

					this.tabs.forEach((tab) => {

						let tconfig = tab.config;
						if (tconfig.domain !== null && config.domain !== null) {

							if (
								tconfig.domain === config.domain
								&& tconfig !== config
							) {
								tab.config = config;
							}

						} else if (tconfig.domain === null && config.domain !== null) {

							let tdomain = tab.ref.domain || null;
							if (tdomain !== null) {

								let tsubdomain = tab.ref.subdomain || null;
								if (tsubdomain !== null) {
									tdomain = tsubdomain + '.' + tdomain;
								}

								if (tdomain === config.domain && tconfig !== config) {
									tab.config = config;
								}

							}

						}

					});

					if (this.tab !== null && this.tab.config === config) {
						this.emit('change', [ this.tab ]);
					}

				}


				if (callback !== null) {
					callback(true);
				} else {
					return true;
				}

			} else {

				if (callback !== null) {
					callback(false);
				} else {
					return false;
				}

			}

		} else {

			if (callback !== null) {
				callback(false);
			} else {
				return false;
			}

		}

	},

	show: function(tab, callback) {

		tab      = tab instanceof Tab   ? tab      : null;
		callback = isFunction(callback) ? callback : null;


		if (tab !== null) {

			if (this.tabs.includes(tab) === false) {
				this.tabs.push(tab);
			}

			if (this.tab !== null) {
				this.emit('hide', [ this.tab, this.tabs ]);
			}

			if (this.tab !== tab) {
				this.tab = tab;
				this.emit('show', [ this.tab, this.tabs ]);
			}


			if (callback !== null) {
				callback(tab);
			} else {
				return tab;
			}

		} else if (tab === null) {

			if (this.tab !== null) {
				this.emit('hide', [ this.tab, this.tabs ]);
			}

			if (this.tabs.length > 0) {
				this.tab = this.tabs[this.tabs.length - 1];
				this.emit('show', [ this.tab, this.tabs ]);
			} else {
				this.tab = null;
			}


			if (callback !== null) {
				callback(this.tab);
			} else {
				return this.tab;
			}

		} else {

			if (callback !== null) {
				callback(null);
			} else {
				return null;
			}

		}

	}

});


export { Browser };
