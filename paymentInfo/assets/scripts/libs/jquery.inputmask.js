
(function ($) {
    if ($.fn.inputmask == undefined) {
        $.inputmask = {
            //options default
            defaults: {
                placeholder: " ",
                repeat: 0, //repetitions of the mask
                autoUnmask: false, //automatically unmask when retrieving the value with $.fn.val or value if the browser supports __lookupGetter__ or getOwnPropertyDescriptor
                onKeyUp: $.noop, //override to implement autocomplete on certain keys for example
                onKeyDown: $.noop, //override to implement autocomplete on certain keys for example
                //numeric basic properties
                numericInput: false, //numericInput input direction style (input shifts to the left while holding the caret position)
                //numeric basic properties
                definitions: {
                    '9': {
                        validator: "[0-9]",
                        cardinality: 1
                    },
                },
                keyCode: { BACKSPACE: 8
                },
            },
            val: $.fn.val //store the original jquery val function
        };

        $.fn.inputmask = function (fn, options) {
            var opts = $.extend(true, {}, $.inputmask.defaults, options);

            var iphone = navigator.userAgent.match(/iphone/i) != null;
            var android = navigator.userAgent.match(/android/i) != null;
            if (android) {
                var version = parseInt(new RegExp(/[0-9]+/).exec(browser));
            }

            opts = $.extend(true, {}, $.inputmask.defaults, fn);
            //init buffer
            var _buffer = getMaskTemplate();
            var tests = getTestingChain();
            return this.each(function () {
                mask(this);
            });


            //helper     functions
            function getMaskTemplate() {
                var escaped = false, outCount = 0;
                var singleMask = $.map(opts.mask.split(""), function (element, index) {
                var outElem = [];
                    outElem.push(getPlaceHolder(outCount + i));
                return outElem;
                });

                //allocate repetitions
                var repeatedMask = singleMask.slice();
                for (var i = 1; i < opts.repeat; i++) {
                    repeatedMask = repeatedMask.concat(singleMask.slice());
                }

                return repeatedMask;
            }

            //test definition => {fn: RegExp/function, cardinality: int, optionality: bool, newBlockMarker: bool, offset: int, casing: null/upper/lower, def: definitionSymbol}
            function getTestingChain() {
                var isOptional = false, escaped = false;
                var newBlockMarker = false; //indicates wheter the begin/ending of a block should be indicated
                return $.map(opts.mask.split(""), function (element, index) {
                    var outElem = [];
                    var maskdef = opts.definitions[element];
                    if (maskdef && !escaped) {
                        outElem.push({ fn: maskdef.validator ? typeof maskdef.validator == 'string' ? new RegExp(maskdef.validator) : new function () { this.test = maskdef.validator; } : new RegExp("."), cardinality: maskdef.cardinality, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: maskdef["casing"], def: element });
                    } else {
                        outElem.push({ fn: null, cardinality: 0, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: null, def: element });
                    }
                    //reset newBlockMarker
                    newBlockMarker = false;
                    return outElem;
                });
            }

            function isValid(pos, c, buffer, strict) { //strict true ~ no correction or autofill
                var result = false;
                if (pos >= 0 && pos < getMaskLength()) {
                    var testPos = determineTestPosition(pos), loopend = c ? 1 : 0, chrs = '';
                    for (var i = tests[testPos].cardinality; i > loopend; i--) {
                        chrs += getBufferElement(buffer, testPos - (i - 1));
                    }
                    if (c) {
                        chrs += c;
                    }
                    //return is false or a json object => { pos: ??, c: ??}
                    result = tests[testPos].fn != null ? tests[testPos].fn.test(chrs, buffer, pos, strict, opts) : false;
                }
                return result;
            }

            function isMask(pos) {
                var testPos = determineTestPosition(pos);
                var test = tests[testPos];

                return test != undefined ? test.fn : false;
            }

            function determineTestPosition(pos) {
                return pos % tests.length;
            }

            function getPlaceHolder(pos) {
                return opts.placeholder.charAt(pos % opts.placeholder.length);
            }

            function getMaskLength() {
                var calculatedLength = _buffer.length;
                return calculatedLength;
            }

            //pos: from position
            function seekNext(buffer, pos) {
                var maskL = getMaskLength();
                if (pos >= maskL) return maskL;
                var position = pos;
                while (++position < maskL && !isMask(position)) { };
                return position;
            }
            //pos: from position
            function seekPrevious(buffer, pos) {
                var position = pos;
                if (position <= 0) return 0;

                while (--position > 0 && !isMask(position)) { };
                return position;
            }

            function setBufferElement(buffer, position, element) {
                //position = prepareBuffer(buffer, position);

                var elem = element;
                buffer[position] = elem;
            }
            function getBufferElement(buffer, position, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);
                return buffer[position];
            }

            function writeBuffer(input, buffer, caretPos) {
                input._valueSet(buffer.join(''));
                if (caretPos != undefined) {
                        caret(input, caretPos);
                }
            };
            function clearBuffer(buffer, start, end) {
                for (var i = start, maskL = getMaskLength(); i < end && i < maskL; i++) {
                    setBufferElement(buffer, i, getBufferElement(_buffer.slice(), i));
                }
            };

            function setReTargetPlaceHolder(buffer, pos) {
                setBufferElement(buffer, pos, getBufferElement(_buffer));
            }


            //functionality fn

            function caret(input, begin, end) {
                var npt = input.jquery && input.length > 0 ? input[0] : input;
                if (typeof begin == 'number') {
                    end = (typeof end == 'number') ? end : begin;
                    npt.setSelectionRange(begin, end);
                } else {
                    var caretpos = android ? caretposCorrection : null, caretposCorrection = null;
                        begin = npt.selectionStart;
                        end = npt.selectionEnd;
                        caretpos = { begin: begin, end: end };
                    return caretpos;
                }
            };

            function mask(el) {
                var $input = $(el);
                if (!$input.is(":input")) return;

                //store original buffer in the input element - used to get the unmasked value
                $input.data('inputmask', {
                    '_buffer': _buffer,
                });
                patchValueProperty(el);

                //init vars
                var buffer = _buffer.slice(),
                isRTL = false;
                $input.unbind(".inputmask");
                $input.bind("keydown.inputmask", keydownEvent
                ).bind("keypress.inputmask", keypressEvent
                ).bind("keyup.inputmask", keyupEvent)

                function patchValueProperty(npt) {
                    npt._valueGet = function () { return this.value; }
                    npt._valueSet = function (value) { this.value = value; }
                }

                //shift chars to left from start to end and put c at end position if defined
                function shiftL(start, end, c) {
                    while (!isMask(start) && start - 1 >= 0) start--;
                    for (var i = start; i < end && i < getMaskLength(); i++) {
                        if (isMask(i)) {
                            setReTargetPlaceHolder(buffer, i);
                            var j = seekNext(buffer, i);
                            var p = getBufferElement(buffer, j);
                        }
                    }
                    return start; //return the used start position
                }

                function keydownEvent(e) {
                    //Safari 5.1.x - modal dialog fires keypress twice workaround
                    skipKeyPressEvent = false;

                    var input = this, k = e.keyCode, pos = caret(input);

                    //backspace, delete, and escape get special treatment
                    if (k == opts.keyCode.BACKSPACE || k == opts.keyCode.DELETE || (iphone)) {//backspace/delete
                        var maskL = getMaskLength();
                            var beginPos = pos.begin - (k == opts.keyCode.DELETE ? 0 : 1);
                            beginPos = shiftL(beginPos, maskL);
                            writeBuffer(input, buffer, beginPos);
                        return false;
                    }

                    opts.onKeyDown.call(this, e, opts); //extra stuff to execute on keydown
                    ignorable = $.inArray(k, opts.ignorables) != -1;
                }

                function keypressEvent(e) {
                    //Safari 5.1.x - modal dialog fires keypress twice workaround
                    if (skipKeyPressEvent) return false;
                    skipKeyPressEvent = true;

                    var input = this, $input = $(input);

                    e = e || window.event;
                    var k = e.which || e.charCode || e.keyCode;

                    if (e.ctrlKey || e.altKey || e.metaKey || ignorable) {//Ignore
                        return true;
                    } else {
                        if (k) {
                            $input.trigger('input');

                            var pos = caret(input), c = String.fromCharCode(k), maskL = getMaskLength();
                            clearBuffer(buffer, pos.begin, pos.end);

                            if (isRTL) {
                                var p = opts.numericInput ? pos.end : seekPrevious(buffer, pos.end), np;
                                if (android) writeBuffer(input, buffer, pos.begin);
                            }
                            else {
                                var p = seekNext(buffer, pos.begin - 1), np;
                                if ((np = isValid(p, c, buffer, false)) !== false) {
                                    if (np !== true) {
                                        p = np.pos || p; //set new position from isValid
                                    }
                                    else setBufferElement(buffer, p, c);
                                    var next = seekNext(buffer, p);
                                    writeBuffer(input, buffer, next);

                                } else if (android) writeBuffer(input, buffer, pos.begin);
                            }
                            return false;
                        }
                    }
                }
            }

            return this; //return this to expose publics
        };
    }
})(jQuery);
