// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'cancelSnipe',
        name: 'Cancel Snipe Helper',
        version: '',
        author: '',
        authorUrl: '',
        helpLink:
            '',
    },
    translations: {
        en_DK: {
            'Cancel Snipe Helper': 'Cancel Snipe Helper',
            Help: 'Help',
            'Go to Command then run script!': 'Go to Command then run script!',
            'There was an error!': 'There was an error!',
            'Enter landing time:': 'Enter landing time:',
            'Calculate Cancel Snipe': 'Calculate Cancel Snipe',
            'This field is required!': 'This field is required!',
            'Server Time:': 'Server Time:',
            'Cancel Time:': 'Cancel Time:',
            'Cancel In:': 'Cancel In:',
            'Cancel snipe is not possible!': 'Cancel snipe is not possible!',
        },

      pt_PT: {
            'Cancel Snipe Helper': 'Snipe por Cancelamento',
            Help: 'Help',
            'Go to Command then run script!': 'Entra nos comandos para correr o Script!',
            'There was an error!': 'Ocorreu um erro!',
            'Enter landing time:': 'Inserir tempo de chegada:',
            'Calculate Cancel Snipe': 'Calcular Snipe',
            'This field is required!': 'Este campo é mandatório!',
            'Server Time:': 'Tempo do Servidor:',
            'Cancel Time:': 'Tempo de Cancelamento:',
            'Cancel In:': 'Cancelar em:',
            'Cancel snipe is not possible!': 'Não é possível o Snipe!',
        },
    },
    allowedMarkets: [],
    allowedScreens: ['info_command'],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

$.getScript(
    `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
        // Initialize Library
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();
        const isValidScreen = twSDK.checkValidLocation('screen');

        // Entry point
        if (isValidScreen) {
            try {
                // build user interface
                buildUI();

                // register action handler
                handleCalculateSnipe();
            } catch (error) {
                UI.ErrorMessage(twSDK.tt('There was an error!'));
                console.error(`${scriptInfo} Error:`, error);
            }
        } else {
            UI.ErrorMessage(twSDK.tt('Go to Command then run script!'));
        }

        // Render: Build the user interface
        function buildUI() {
            const landingTime =
                localStorage.getItem(
                    `${scriptConfig.scriptData.prefix}_landing_time`
                ) || '';

            const content = `
                <div class="ra-mb15">
                    <label class="ra-label" for="raLandingTime">${twSDK.tt(
                        'Enter landing time:'
                    )}</label>
                    <input class="ra-input" id="raLandingTime" type="text" value="${landingTime}">
                </div>
                <div style="display:none;" id="raSnipeTime">
                    <div class="ra-mb15 ra-cancel-in-time">
                        <b>${twSDK.tt(
                            'Server Time:'
                        )}</b> <span id="raServerTime" class="ra-server-time"></span><br>
                        <b>${twSDK.tt(
                            'Cancel Time:'
                        )}</b> <span id="raSnipeTimeInput" class="ra-cancel-snipe-time"></span><br>
                        <b>${twSDK.tt(
                            'Cancel In:'
                        )}</b> <span id="raSnipeCancelIn" class="timer ra-cancel-snipe-cancel-time"></span>
                    </div>
                </div>
                <div class="ra-mb15">
                    <a href="javascript:void(0);" id="raCalculateCancelSnipeBtn" class="btn">
                        ${twSDK.tt('Calculate Cancel Snipe')}
                    </a>
                </div>
            `;

            const customStyle = `
                .ra-label { display: block; margin-bottom: 5px; font-weight: bold; }
                .ra-input { width: 100%; height: auto; padding: 8px; font-size: 14px; }
                .ra-cancel-in-time { font-size: 16px; font-weight: 600; }
                .ra-cancel-snipe-time { color: #3236a8; }
                .ra-cancel-snipe-cancel-time { color: #ff0000; }
                .ra-cancel-snipe-helper .btn-confirm-yes { padding: 3px; }
            `;

            jQuery(window.TribalWars).on('global_tick', function () {
                const serverDateTime = Timing.getCurrentServerTime();
                const formattedServerTime =
                    getFormattedCancelTime(serverDateTime);
                jQuery('#raServerTime').text(formattedServerTime);
                Timing.tickHandlers.timers.init();
            });

            setTimeout(function () {
                jQuery('#raLandingTime').focus();
                if (landingTime.length) {
                    jQuery('#raCalculateCancelSnipeBtn').trigger('click');
                }
            }, 10);

            twSDK.renderFixedWidget(
                content,
                'raCancelSnipeHelper',
                'ra-cancel-snipe-helper',
                customStyle
            );
        }

        // Action Handler: Calculate cancel snipe
        function handleCalculateSnipe() {
            jQuery('#raCalculateCancelSnipeBtn').on('click', function (e) {
                e.preventDefault();

                const noblesLandingTime = jQuery('#raLandingTime').val().trim();

                if (!noblesLandingTime) {
                    UI.ErrorMessage(twSDK.tt('This field is required!'));
                }

                localStorage.setItem(
                    `${scriptConfig.scriptData.prefix}_landing_time`,
                    noblesLandingTime
                );

                jQuery(this).addClass('btn-confirm-yes');
                jQuery('#raLandingTime').val(noblesLandingTime);

                const noblesLandingTimeObject = new Date(
                    noblesLandingTime
                ).getTime();

                const arrivalTime = getArrivalTimeDifference();
                const difference =
                    (parseInt(noblesLandingTimeObject) -
                        parseInt(arrivalTime)) /
                    2;
                const cancelTimeObject = new Date(
                    noblesLandingTimeObject - difference
                );
                const formattedCancelTime =
                    getFormattedCancelTime(cancelTimeObject);

                const serverTimeObject = twSDK.getServerDateTimeObject();
                const cancelIn =
                    cancelTimeObject.getTime() - serverTimeObject.getTime();

                if (cancelIn > 0) {
                    let formattedCancelIn = twSDK.secondsToHms(cancelIn / 1000);

                    jQuery('#raSnipeTime').show();
                    jQuery('#raSnipeTimeInput').text(formattedCancelTime);
                    jQuery('#raSnipeCancelIn').text(formattedCancelIn);

                    Timing.tickHandlers.timers.init();
                } else {
                    UI.ErrorMessage(twSDK.tt('Cancel snipe is not possible!'));
                }
            });
        }

        // Helper: Get duration time
        function getArrivalTimeDifference() {
            let cats = 5;

            let table = document.getElementsByClassName('vis');
            let duration1 = table[0].rows[cats].cells[1];
            let duration2 = duration1.innerHTML.split('<')[0];
            let duration =
                duration2.split(':')[0] * 3600000 +
                duration2.split(':')[1] * 60000 +
                duration2.split(':')[2] * 1000;

            if (isNaN(duration)) {
                cats = 6;
                duration1 = table[0].rows[cats].cells[1];
                duration2 = duration1.innerHTML.split('<')[0];
                duration =
                    duration2.split(':')[0] * 3600000 +
                    duration2.split(':')[1] * 60000 +
                    duration2.split(':')[2] * 1000;
            }

            let arrival = table[0].rows[cats + 1].cells[1].innerHTML
                .split('"')[0]
                .split('<')[0];
            let arrivalTimeObject = new Date(arrival).getTime();
            let arrivalTimeDifference = arrivalTimeObject - duration;

            return arrivalTimeDifference;
        }

        // Helper: Get formatted cancel time
        function getFormattedCancelTime(cancelTime) {
            const time = new Date(cancelTime).toString();
            const [_, month, date, year, hour] = time.split(' ');
            return `${month} ${date}, ${year} ${hour}`;
        }
    }
);
