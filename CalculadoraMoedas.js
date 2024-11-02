// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'coinMintingCalculator',
        name: 'Calculadora de Moedas',
        
    },
    translations: {
        en_DK: {
            'Coin Minting Calculator': 'Coin Minting Calculator',
            Help: 'Help',
            'Redirecting...': 'Redirecting...',
            'There was an error!': 'There was an error!',
            'Total Wood/Hour': 'Total Wood/Hour',
            'Total Stone/Hour': 'Total Stone/Hour',
            'Total Iron/Hour': 'Total Iron/Hour',
            'Wood Limit': 'Wood Limit',
            'Stone Limit': 'Stone Limit',
            'Iron Limit': 'Iron Limit',
            Coins: 'Coins',
        },
        fr_FR: {
            'Coin Minting Calculator': 'Calculateur - Frapper des piÃ¨ces',
            Help: 'Aide',
            'Redirecting...': 'Redirection...',
            'There was an error!': 'Il y a eu une erreur!',
            'Total Wood/Hour': 'Total Bois/Heure',
            'Total Stone/Hour': 'Total Argile/Heure',
            'Total Iron/Hour': 'Total Fer/Heure',
            'Wood Limit': 'Limite de Bois',
            'Stone Limit': "Limite d'Argile",
            'Iron Limit': 'Limite de Fer',
            Coins: 'PiÃ¨ces',
        },

      pt_PT: {
            'Coin Minting Calculator': 'Calculadora de Moedas',
            Help: 'Ajuda',
            'Redirecting...': 'A redirecionar...',
            'There was an error!': 'Encontramo um erro!',
            'Total Wood/Hour': 'Total Madeira/Hora',
            'Total Stone/Hour': 'Total Barro/Hora',
            'Total Iron/Hour': 'Total Ferro/Hora',
            'Wood Limit': 'Limite de Madeira',
            'Stone Limit': 'Limite de Barro',
            'Iron Limit': 'Limite de Ferro',
            Coins: 'Moedas',
        },
    },
    allowedMarkets: [],
    allowedScreens: ['snob'],
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

        if (isValidScreen) {
            try {
                initMain();
            } catch (error) {
                UI.ErrorMessage(twSDK.tt('There was an error!'));
                console.error(`${scriptInfo} Error:`, error);
            }
        } else {
            UI.InfoMessage(twSDK.tt('Redirecting...'));
            twSDK.redirectTo('snob');
        }

        // Initialize main script logic
        async function initMain() {
            const worldConfig = await twSDK.getWorldConfig();

            const { totalWoodPerHour, totalStonePerHour, totalIronPerHour } =
                await getResourcesPerHour(worldConfig.config.speed);
            const { woodLimit, stoneLimit, ironLimit, coins } = calculateCoins(
                totalWoodPerHour,
                totalStonePerHour,
                totalIronPerHour
            );

            if (DEBUG) {
                console.debug(
                    `${scriptInfo} worldSpeed`,
                    worldConfig.config.speed
                );
                console.debug(
                    `${scriptInfo} totalWoodPerHour`,
                    totalWoodPerHour
                );
                console.debug(
                    `${scriptInfo} totalStonePerHour`,
                    totalStonePerHour
                );
                console.debug(
                    `${scriptInfo} totalIronPerHour`,
                    totalIronPerHour
                );
                console.debug(`${scriptInfo} woodLimit`, woodLimit);
                console.debug(`${scriptInfo} stoneLimit`, stoneLimit);
                console.debug(`${scriptInfo} ironLimit`, ironLimit);
                console.debug(`${scriptInfo} coins`, coins);
            }

            const content = `
                <div class="ra-table-container ra-mb15">
                    <table class="ra-table" width="100%">
                        <tbody>
                            <tr>
                                <td>
                                    <b>${twSDK.tt('Total Wood/Hour')}</b>
                                </td>
                                <td>
                                    ${twSDK.formatAsNumber(totalWoodPerHour)}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>${twSDK.tt('Total Stone/Hour')}</b>
                                </td>
                                <td>
                                    ${twSDK.formatAsNumber(totalStonePerHour)}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>${twSDK.tt('Total Iron/Hour')}</b>
                                </td>
                                <td>
                                    ${twSDK.formatAsNumber(totalIronPerHour)}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>${twSDK.tt('Wood Limit')}</b>
                                </td>
                                <td>
                                    ${twSDK.formatAsNumber(woodLimit)}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>${twSDK.tt('Stone Limit')}</b>
                                </td>
                                <td>
                                    ${twSDK.formatAsNumber(stoneLimit)}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>${twSDK.tt('Iron Limit')}</b>
                                </td>
                                <td>
                                    ${twSDK.formatAsNumber(ironLimit)}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <b>${twSDK.tt('Coins')}</b>
                                </td>
                                <td>
                                    <b>${twSDK.formatAsNumber(coins)}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;

            const customStyle = `
                .ra-table-container td { text-align: left; }
            `;

            twSDK.renderFixedWidget(
                content,
                'raCoinMintingCalculator',
                'ra-coin-minting-calculator',
                customStyle
            );
        }

        // Helper: Get amount of resources per hour
        async function getResourcesPerHour(worldSpeed) {
            const response = await jQuery.get(
                game_data.link_base_pure + 'overview_villages&mode=buildings'
            );
            const htmlDoc = jQuery.parseHTML(response);

            const woodLevels = [];
            const stoneLevels = [];
            const ironLevels = [];

            const woodLevelsEl = jQuery(htmlDoc).find(
                '.upgrade_building.b_wood'
            );
            const stoneLevelsEl = jQuery(htmlDoc).find(
                '.upgrade_building.b_stone'
            );
            const ironLevelsEl = jQuery(htmlDoc).find(
                '.upgrade_building.b_iron'
            );

            woodLevelsEl.each(function () {
                woodLevels.push(parseInt(jQuery(this).text()));
            });
            stoneLevelsEl.each(function () {
                stoneLevels.push(parseInt(jQuery(this).text()));
            });
            ironLevelsEl.each(function () {
                ironLevels.push(parseInt(jQuery(this).text()));
            });

            const { totalWoodPerHour, totalStonePerHour, totalIronPerHour } =
                calculateTotalResources(
                    woodLevels,
                    stoneLevels,
                    ironLevels,
                    worldSpeed
                );

            return { totalWoodPerHour, totalStonePerHour, totalIronPerHour };
        }

        // Helper: Calculate total resources produced for each resource type
        function calculateTotalResources(
            woodLevels,
            stoneLevels,
            ironLevels,
            worldSpeed
        ) {
            let totalWoodPerHour = 0;
            let totalStonePerHour = 0;
            let totalIronPerHour = 0;

            woodLevels.forEach((item) => {
                totalWoodPerHour += twSDK.resPerHour[item] * worldSpeed;
            });

            stoneLevels.forEach((item) => {
                totalStonePerHour += twSDK.resPerHour[item] * worldSpeed;
            });

            ironLevels.forEach((item) => {
                totalIronPerHour += twSDK.resPerHour[item] * worldSpeed;
            });

            return { totalWoodPerHour, totalStonePerHour, totalIronPerHour };
        }

        // Helper: Calculate amount of coins based on total resources produced in a day
        function calculateCoins(woodHour, stoneHour, ironHour) {
            const coinCost = BuildingSnob.Modes.train.storage_item;

            const woodLimit = (woodHour * 24) / coinCost.wood;
            const stoneLimit = (stoneHour * 24) / coinCost.stone;
            const ironLimit = (ironHour * 24) / coinCost.iron;

            const coins = Math.min(woodLimit, stoneLimit, ironLimit);

            return { woodLimit, stoneLimit, ironLimit, coins };
        }
    }
);
