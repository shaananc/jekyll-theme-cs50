// Infer baseurl from this file's (known) path
const a = document.createElement('a');
a.href = document.currentScript.src;
const matches = a.pathname.match(/^(.+)\/assets\/jekyll-theme-cs50\.js$/);
if (matches) {
    window.baseurl = matches[1];
}

// https://github.com/typekit/webfontloader#get-started
WebFont.load({
    google: {
        families: ['PT Sans', 'PT Sans:bold', 'PT Sans:ital']
    }
});

// On DOMContentLoaded
$(document).on('DOMContentLoaded', function() {

    // Current timestamp
    const now = luxon.DateTime.local();

    // data-after, data-before
    $('[data-after], [data-before]').each(function(index, element) {

        // Return true iff element should be removed
        const remove = function() {
            if (data = $(element).attr('data-before')) {
                return !(now < luxon.DateTime.fromISO($(element).attr('data-before')));
            }
            else if (data = $(element).attr('data-after')) {
                return !(now > luxon.DateTime.fromISO($(element).attr('data-after')));
            }
        };

        // Remember element's siblings
        const $prev = $(element).prev(), $next = $(element).next();

        // Siblings to be merged
        const SIBLINGS = ['DL', 'OL', 'UL'];

        // If element should be removed
        if (remove()) {

            // Remove element
            $(element).remove();

            // Merge siblings
            if (SIBLINGS.includes($prev.prop('tagName')) && $prev.prop('tagName') === $next.prop('tagName')) {
                $prev.append($next.children());
                $next.remove();
            }
        }
        else {

            // Unwrap element
            const $children = $(element).children().unwrap();

            // If element had one child
            if ($children.length === 1) {

                // Merge siblings
                if (SIBLINGS.includes($children.prop('tagName'))) {
                    if ($prev.prop('tagName') === $children.prop('tagName')) {
                        $children.prepend($prev.children());
                        $prev.remove();
                    }
                    if ($children.prop('tagName') == $next.prop('tagName')) {
                        $children.append($next.children());
                        $next.remove();
                    }
                }
            }
        }
    });

    // data-alert
    $('[data-alert]').each(function(index, element) {
        if ($(element).attr('data-alert')) {
            $(element).addClass('alert-' + $(element).attr('data-alert'));
            $(element).find('a').addClass('alert-link');
            $(element).find('h1, h2, h3, h4, h5, h6').each(function(index, element) {
                const tagName = $(element).prop('tagName');
                $(element).replaceWith(function() {
                    return $('<p>').append($(this).contents()).addClass(tagName.toLowerCase()).addClass('alert-heading');
                });
            });
        }
    });

    // data-calendar
    $('[data-calendar]').each(function(index, element) {

        // Display calendar in user's time zone
        // https://stackoverflow.com/a/32511510/5156190
        if ($(element).attr('data-calendar')) {
            let src = $(element).attr('data-calendar');
            src += '&ctz=' + luxon.DateTime.local().zoneName;
            $(element).attr('src', src);
        }
    });

    // data-local
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#Syntax
    // https://english.stackexchange.com/a/100754
    $('[data-local]').each(function(index, element) {

        // HTML to display
        let short, long;

        // Parse attribute
        const local = $(element).attr('data-local').split('/');

        // If range
        if (local.length == 2) {

            // Parse start
            const start = luxon.DateTime.fromISO(local[0]).setLocale(CS50.locale);

            // Parse end
            const end = luxon.DateTime.fromISO(local[1]).setLocale(CS50.locale);

            // Options for formatting start
            const opts = {
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                month: 'short',
                weekday: 'short',
                year: 'numeric'
            };

            // If start and end on different dates or if clocks change between start and end
            if (start.toLocaleString(luxon.DateTime.DATE_SHORT) !== end.toLocaleString(luxon.DateTime.DATE_SHORT) ||
                start.toLocal().offsetNameLong !== end.toLocal().offsetNameLong) {

                // Add time zone to start
                opts.timeZoneName = 'short';
            }

            // If start and end on same date (and English locale)
            if (CS50.locale === 'en' && start.toLocaleString(luxon.DateTime.DATE_SHORT) === end.toLocaleString(luxon.DateTime.DATE_SHORT)) {

                // Format end without date
                short = start.toLocaleString(opts) + ' – ' + end.toLocaleString({
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZoneName: 'short'
                });
            }

            // If start and end on different dates
            else {

                // Format end without date
                short = start.toLocaleString(opts) + ' – ' + end.toLocaleString({
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    month: 'short',
                    timeZoneName: 'short',
                    weekday: 'short',
                    year: 'numeric'
                });
            }

            // Format start's time zone
            long = start.toLocal().offsetNameLong;

            // If clocks change between start and end
            if (start.toLocal().offsetNameLong !== end.toLocal().offsetNameLong) {

                // Add end's time zone
                long += ' – ' + end.toLocal().offsetNameLong;
            }
        }
        else {

            // Parse start
            const start = luxon.DateTime.fromISO(local[0]).setLocale(CS50.locale);

            // Format start
            short = start.toLocaleString({
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                month: 'short',
                timeZoneName: 'short',
                weekday: 'short',
                year: 'numeric'
            });
            long = start.toLocal().offsetNameLong;
        }

        // Display HTML
        $(this).html(short);

        // If not already linked
        if ($(this).closest('a').length === 0) {

            // If no title already
            // https://stackoverflow.com/a/12161190
            if (typeof $(this).attr('title') === 'undefined') {

                // Add tooltip
                // https://github.com/popperjs/popper-core/issues/276
                $(this).attr('data-boundary', 'window').attr('data-toggle', 'tooltip').attr('data-trigger', 'focus').attr('title', long).tooltip();

                // Don't allow span to wrap, else popovers will be centered between span's overall width
                // https://getbootstrap.com/docs/4.5/components/popovers/#overview
                // https://github.com/popperjs/popper-core/issues/609
                // https://github.com/popperjs/popper-core/issues/9
                $(this).addClass('text-nowrap');

                // Ensure focusable
                // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
                $(this).attr('tabindex', '0');
            }
        }
    });

    // Re-attach tooltips after tables have responded
    // https://github.com/wenzhixin/bootstrap-table/issues/572#issuecomment-76503607
    $('table').on('pre-body.bs.table', function() {
        $('main table [data-toggle="tooltip"]').tooltip('dispose');
    });
    $('table').on('post-body.bs.table', function() {
        $('table [data-toggle="tooltip"]').tooltip();
    });

    // Ensure tables are responsive
    // https://bootstrap-table.com/docs/extensions/mobile/
    $('table').each(function(index, element) {

        // Remove thead temporarily, per https://github.com/wenzhixin/bootstrap-table/issues/5470
        $(element).find('thead').replaceWith($(element).find('thead').contents());

        // Enable bootstrap-table
        try {
            $(element).bootstrapTable({
                classes: 'table table-bordered table-striped',
                minWidth: 992, // https://getbootstrap.com/docs/4.5/layout/overview/#responsive-breakpoints
                mobileResponsive: true
            });
        }
        catch(err) {} // In case no thead
    });

    // data-markers
    $('[data-marker]').each(function(index, element) {

        // Add .fa-ul to parent ul
        $(element).parent().addClass('fa-ul');

        // Filter
        const filter = function() {
            return !$(this).is('ol, ul');
        };

        // Listener
        const click = function(eventObject) {

            // If it wasn't a descendent link that was clicked
            if (!$(eventObject.target).is('a')) {

                // Don't propgate to nested lists
                eventObject.stopPropagation();

                // Toggle marker
                const marker = $(element).attr('data-marker');
                if (marker === '+') {
                    $(element).attr('data-marker', '-');
                    $(element).find('> .fa-li > .fa-plus-square').removeClass('fa-plus-square').addClass('fa-minus-square');
                }
                else if (marker === '-') {
                    $(element).attr('data-marker', '+');
                    $(element).find('> .fa-li > .fa-minus-square').removeClass('fa-minus-square').addClass('fa-plus-square');
                }
                $(window).trigger('resize');
            }
        };

        // Icons
        const plus = $('<span class="fa-li"><i class="far fa-plus-square"></i></span>').click(click);
        const minus = $('<span class="fa-li"><i class="far fa-minus-square"></i></span>').click(click);
        const circle = $('<span class="fa-li"><i class="fas fa-circle"></i></span>');

        // Wrapper
        const $span = $('<span>').click(click);

        // If +
        if ($(element).attr('data-marker') === '+') {
            $(element).contents().filter(filter).wrap($span);
            $(element).prepend(plus);
        }

        // If -
        else if ($(element).attr('data-marker') === '-') {
            $(element).contents().filter(filter).wrap($span);
            $(element).prepend(minus);
        }

        // If *
        else if ($(element).attr('data-marker') === '*') {
            $(element).prepend(circle);
        }
    });

    // Also add .fa-ul to TOC, if any, for consistency
    $('.markdown-toc').addClass('fa-ul');

    // Get next slice of elements
    function next(element) {

        // Next siblings
        const siblings = element.nextAll();

        // First sibling after this element
        const start = siblings.index(element) + 1;

        // Following buttons
        const buttons = siblings.slice(start).find('[data-next]');

        // Last sibling before next button
        let end = (buttons.length > 0) ? siblings.index(buttons[0]) : siblings.length;

        // Next slice
        return siblings.slice(start, end);
    }

    // data-next
    $('[data-next]').each(function(index, element) {

        // Hide next elements
        next($(this).parent()).addClass('next');

        // Listen for clicks
        $(this).click(function() {

            // Show next elements
            next($(this).parent()).removeClass('next');

            // Update margin
            $(window).trigger('resize');

            // Remember p-wrapped button's offset
            let top = $(this).parent().offset().top;
            let bottom = top + $(this).parent().outerHeight(true);

            // Scroll to next elements
            $('html, body').animate({scrollTop: bottom + 1}, 500);

            // Disable button
            $(this).prop('disabled', true);
        });
    });

    // Ensure iframes responsive in Safari on iOS (for, e.g., Google Calendars), per https://stackoverflow.com/a/23083463/5156190
    $('iframe').each(function(index, element) {
        if (!$(this).attr('scrolling')) {
            $(this).attr('scrolling', 'no');
        }
    });

    // Get headings
    let headings = $([
        'main h1',
        'main h2',
        'main h3',
        'main h4',
        'main h5',
        'main h6'].join(','));
    headings.each(function(index, element) {

        // If it has an id
        if ($(element).attr('id')) {

            // Add anchor to heading
            if ($(element).has('a').length === 0) {
                $(element).wrapInner($('<a data-id href="#' + $(element).attr('id') + '"></a>'));
            }

            // Relocate id to an anchor (so that it can be invisibly positioned below any alert)
            // https://stackoverflow.com/a/13184714
            $(element).before($('<a data-id id="' + $(element).attr('id') + '"></a>'))
            $(element).removeAttr('id');
        }
    });

    // Listen for hashchange
    $(window).on('hashchange', function() {

        // Find heading
        const id = window.location.hash.slice(1);
        if (!id) {
            return false;
        }
        const heading = $('#' + id);
        if (!heading.length) {
            return false;
        }

        // Previous siblings
        heading.prevAll().removeClass('next').find('[data-next]').prop('disabled', true);

        // This heading
        heading.removeClass('next');

        // Next siblings
        next(heading).removeClass('next');
    });
    $(window).trigger('hashchange');

    // Listen for resize
    $(window).resize(function() {

        // Return true iff small device (on which aside will be above main)
        const mobile = function() {
            return $('aside').position().top < $('main').position().top;
        };

        // Get headings
        const headings = $([
            'main h1:not(.next)',
            'main h2:not(.next)',
            'main h3:not(.next)',
            'main h4:not(.next)',
            'main h5:not(.next)',
            'main h6:not(.next)'].join(','));

        // Ensure last heading, if any, can be anchored atop page
        if (headings.last().offset()) {
            var top = headings.last().offset().top;
        }
        else {
            var top = 0;
        }

        // On small devices
        if (mobile()) {
            var margin = $(window).height() - ($('main').outerHeight() + $('aside').outerHeight() - top);
        }

        // On large devices
        else {
            var margin = $(window).height() - ($('main').outerHeight() - top);
        }

        // Update margin
        $('main').css('margin-bottom', Math.max(0, Math.ceil(margin)) + 'px');

        // Resize search UI
        if (mobile()) {

            // Shrink
            $('#search .form-control').removeClass('form-control-lg');
            $('#search .btn').removeClass('btn-lg');
        }
        else {

            // Grow
            $('#search .form-control').addClass('form-control-lg');
            $('#search .btn').addClass('btn-lg');
        }

        // Calculate height of alert, if any
        const height = $('#alert').outerHeight(true) || 0;

        // Position aside
        if (mobile()) {
            $('aside').css('height', '');
            $('aside').css('margin-top', height + 'px');
            $('aside').css('top', '');
            $('main').css('margin-top', '');
        }
        else {
            $('aside').css('height', ($(window).height() - height) + 'px');
            $('aside').css('margin-top', '');
            $('aside').css('top', height + 'px');
            $('main').css('margin-top', height + 'px');
        }

        // Position headings' anchors below alert
        // https://stackoverflow.com/a/13184714
        $('a[data-id][id]').css('top', '-' + height + 'px');
    });
    $(window).trigger('resize');

    // Listen for highlights
    // https://chromestatus.com/feature/4733392803332096
    $(document).on('click keyup', function(e) {
        const s = window.getSelection().toString().trim();
        if (s) {
            history.replaceState(null, null, '#:~:text=' + s);
        }
        else {
            if (window.location.hash.startsWith('#:~:text=') || !window.location.hash) {
                history.replaceState(null, null, '');
            }
        }
    });

    // Reveal page
    $('body').removeClass('invisible');
});
