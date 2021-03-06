class NotificationBannerError extends Error {}

const NotificationBannerType = {
	SUCCESS: '#41cc78',
	WARNING: '#fca83b',
	DANGER: '#e25146',
	INFO: '#429ad8',
	NONE: 'transparent'
};

const NotificationBannerPosition = {
	TOP: 'top',
	BOTTOM: 'bottom'
};

class NotificationBanner {

	constructor(opts = {}) {
		this.title = opts.title;
		if (!this.title) {
			throw new NotificationBannerError('Missing required \'title\' property!');
		}

		this.view = opts.view;
		if (!this.view) {
			throw new NotificationBannerError('Missing required \'view\' property!');
		}

		this.type = opts.type || NotificationBannerType.INFO;
		this.position = opts.position || NotificationBannerPosition.BOTTOM;
		this.bannerHeight = this._calculateHeight();

		this.bannerView = Ti.UI.createView({
			backgroundColor: this.type,
			height: this.bannerHeight,
			viewShadowColor: 'rgba(0, 0, 0, 0.3)',
			viewShadowRadius: 7,
			viewShadowOffset: { x: 0, y: -7 }
		});
		this.bannerView.addEventListener('click', () => { this._handleNotificationClick(); });

		const label = Ti.UI.createLabel({
			text: this.title,
			color: '#fff'
		});
		if (this._isiPhoneX()) {
			label[this.position === 'top' ? 'bottom' : 'top'] = 15;
		}
		this.bannerView.add(label);

		this.bannerView[this.position] = -(this.bannerHeight);
	}

	show(opts = { dismissAfterDelay: undefined }) {
		this.showing = true;

		const animationOptions = {};
		animationOptions[this.position] = 0;

		this.view.add(this.bannerView);
		this.bannerView.animate(animationOptions, () => {
			if (opts.dismissAfterDelay) {
				setTimeout(() => {
					this.hide();
				}, opts.dismissAfterDelay);
			}
		});
	}

	hide() {
		const animationOptions = {};
		animationOptions[this.position] = -(this.bannerHeight);

		this.bannerView.animate(animationOptions, () => {
			this.showing = false;
			this.view.remove(this.bannerView);
		});
	}

	flash() {
		this.show({ dismissAfterDelay: 1000 });
	}

	_handleNotificationClick() {
		this.hide();
	}

	_calculateHeight() {
		if (!this._isiPhoneX()) {
			return 46
		}

		if (this.position === NotificationBannerPosition.TOP) {
			return 84
		}

		return 66;
	}

	_isiPhoneX() {
		if (Ti.Platform.osname !== 'iphone' && Ti.Platform.osname !== 'ipad') {
			return; // TODO: Move to "safeAreaInsets" property in SDK 8.0.0+
		}
	
		return ((Ti.Platform.displayCaps.platformWidth === 375 && Ti.Platform.displayCaps.platformHeight === 812)
		|| (Ti.Platform.displayCaps.platformWidth === 414 && Ti.Platform.displayCaps.platformHeight === 896))
		&& (Ti.Platform.displayCaps.logicalDensityFactor === 3 || Ti.Platform.displayCaps.logicalDensityFactor === 2);
	};
	
}

export {
	NotificationBanner,
	NotificationBannerType,
	NotificationBannerPosition,
	NotificationBannerError
};
