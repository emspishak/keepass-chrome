/**
 * @fileoverview A progress bar for the decryption process.
 */



/**
 * @constructor
 */
keepasschrome.DecryptProgressBar = function() {

  /**
   * @type {number}
   * @private
   */
  this.totalEncryptionRounds_;

  /**
   * @type {number}
   * @private
   */
  this.completedEncryptionRounds_ = 0;

  /**
   * @type {!Element}
   * @private
   */
  this.progressBarInnerElement_;


  /**
   * @type {number}
   * @private
   */
  this.progressBarWidth_;
};


/**
 * Renders itself at the end of the parent element.
 * @param {!Element} parentElement The parent of this progress bar.
 */
keepasschrome.DecryptProgressBar.prototype.render = function(parentElement) {
  var progressBarElement = document.createElement('span');
  progressBarElement.classList.add('decrypt-progress-bar');

  this.progressBarInnerElement_ = document.createElement('span');
  this.progressBarInnerElement_.classList.add('decrypt-progress-bar-inner');
  progressBarElement.appendChild(this.progressBarInnerElement_);

  parentElement.appendChild(progressBarElement);

  this.progressBarWidth_ =
      parseInt(window.getComputedStyle(progressBarElement).width, 10);
};


/**
 * Sets the number of times to encrypt the password to generate the decryption
 *     key.
 * @param {number} totalEncryptionRounds The total number of encryption rounds.
 */
keepasschrome.DecryptProgressBar.prototype.setTotalEncryptionRounds = function(
    totalEncryptionRounds) {
  this.totalEncryptionRounds_ = totalEncryptionRounds;
};


/**
 * Call when a single encryption round is complete.
 */
keepasschrome.DecryptProgressBar.prototype.encryptionRoundComplete =
    function() {
  this.completedEncryptionRounds_++;
  this.maybeUpdateProgressBar_();
};


/**
 * Decides whether or not to update the progress bar (doesn't update for every
 * round complete becasue that's slow) and updates it.
 * @private
 */
keepasschrome.DecryptProgressBar.prototype.maybeUpdateProgressBar_ =
    function() {
  if (this.completedEncryptionRounds_ % 250 === 0) {
    this.progressBarInnerElement_.style.width =
        (this.completedEncryptionRounds_ / this.totalEncryptionRounds_) *
            this.progressBarWidth_ + 'px';
  }
};
