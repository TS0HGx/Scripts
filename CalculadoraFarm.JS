// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'farmEfficiencyCalculator',
        name: `Farm Efficiency Calculator`,
        version: '',
        author: '',
        authorUrl: '',
        helpLink:
            '',
    },
    translations: {
        en_DK: {
            'Farm Efficiency Calculator': 'Farm Efficiency Calculator',
            Help: 'Help',
            'Redirecting...': 'Redirecting...',
            'There was an error!': 'There was an error!',
            'There was an error while fetching the report data!':
                'There was an error while fetching the report data!',
            'Farmed Villages': 'Farmed Villages',
            'Total Looted': 'Total Looted',
            'Total Estimated': 'Total Estimated',
            'Total Wood Hauled': 'Total Wood Hauled',
            'Total Clay Hauled': 'Total Clay Hauled',
            'Total Iron Hauled': 'Total Iron Hauled',
            'Total LC Used': 'Total LC Used',
            'Farming Efficiency': 'Farming Efficiency',
            'Average Loot': 'Average Loot',
            'Average Estimated Loot': 'Average Estimated Loot',
            'Average Hauled Wood': 'Average Hauled Wood',
            'Average Hauled Clay': 'Average Hauled Clay',
            'Average Hauled Iron': 'Average Hauled Iron',
        },

 pt_PT: {
            'Farm Efficiency Calculator': 'Calculadora Farm',
            Help: 'Ajuda',
            'Redirecting...': 'A redirecionar...',
            'There was an error!': 'Um erro ocurreu!',
            'There was an error while fetching the report data!':
                'Ocorreu um problema a carregar os dados!',
            'Farmed Villages': 'Aldeias farmadas',
            'Total Looted': 'Total Farmado',
            'Total Estimated': 'Total estimado',
            'Total Wood Hauled': 'Total Madeira',
            'Total Clay Hauled': 'Total Barro',
            'Total Iron Hauled': 'Total Ferro',
            'Total LC Used': 'Total LC Used',
            'Farming Efficiency': 'Eficiencia do Farm',
            'Average Loot': 'Loot Medio',
            'Average Estimated Loot': 'Loot médio estimado',
            'Average Hauled Wood': 'Média de Madeira',
            'Average Hauled Clay': 'Média de Barro',
            'Average Hauled Iron': 'Média de Ferro',
        },
        hu_HU: {
            'Farm Efficiency Calculator': 'Farm hatÃ©konysÃ¡gi kalkulÃ¡tor',
            Help: 'SegÃ­tsÃ©g',
            'Redirecting...': 'ÃtirÃ¡nyÃ­tÃ¡s...',
            'There was an error!': 'Hiba lÃ©pett fel!',
            'There was an error while fetching the report data!':
                'Hiba lÃ©pett fel az adatok kiolvasÃ¡sa kÃ¶zbe a jelentÃ©sekbÅ‘l!',
            'Farmed Villages': 'Farmolt faluk',
            'Total Looted': 'Ã–ssz. farmolÃ¡s',
            'Total Estimated': 'Ã–ssz. becsÃ¼lt farmolÃ¡s',
            'Total Wood Hauled': 'Ã–ssz. farmolt fa',
            'Total Clay Hauled': 'Ã–ssz. farmolt agyag',
            'Total Iron Hauled': 'Ã–ssz. farmolt vas',
            'Total LC Used': 'Ã–ssz. KL hasznÃ¡latban',
            'Farming Efficiency': 'Farm hatÃ©konysÃ¡gi rÃ¡ta',
            'Average Loot': 'Farm Ã¡tlag',
            'Average Estimated Loot': 'Farm becsÃ¼lt Ã¡tlag',
            'Average Hauled Wood': 'Farmolt fa Ã¡tlag',
            'Average Hauled Clay': 'Farmolt agyag Ã¡tlag',
            'Average Hauled Iron': 'Farmolt vas Ã¡tlag',
        },
    },
    allowedMarkets: [],
    allowedScreens: ['report'],
    allowedModes: ['attack'],
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
        const isValidMode = twSDK.checkValidLocation('mode');

        // Entry Point
        (function () {
            try {
                if (isValidScreen && isValidMode) {
                    // build user interface
                    buildUI();
                } else {
                    UI.InfoMessage(twSDK.tt('Redirecting...'));
                    twSDK.redirectTo('report&mode=attack');
                }
            } catch (error) {
                UI.ErrorMessage(twSDK.tt('There was an error!'));
                console.error(`${scriptInfo} Error:`, error);
            }
        })();

        // Render: Build user interface
        function buildUI() {
            const farmingData = [];
            const reportUrls = getReportUrls();

            twSDK.startProgressBar(reportUrls.length);

            twSDK.getAll(
                reportUrls,
                function (index, data) {
                    twSDK.updateProgressBar(index, reportUrls.length);

                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(data, 'text/html');
                    const attackResults =
                        jQuery(htmlDoc).find('#attack_results');

                    if (attackResults !== null) {
                        let attackRes = jQuery(htmlDoc).find('#attack_results');
                        let hauledResources = attackRes
                            .children('tbody')
                            .children('tr:first-child')
                            .children('td:last-child')
                            .text();

                        let hauledWood =
                            parseInt(
                                jQuery(attackRes)
                                    .find('tr:first-child .nowrap:eq(0)')
                                    .text()
                                    ?.replace('.', '')
                            ) || 0;
                        let hauledClay =
                            parseInt(
                                jQuery(attackRes)
                                    .find('tr:first-child .nowrap:eq(1)')
                                    .text()
                                    ?.replace('.', '')
                            ) || 0;
                        let hauledIron =
                            parseInt(
                                jQuery(attackRes)
                                    .find('tr:first-child .nowrap:eq(2)')
                                    .text()
                                    ?.replace('.', '')
                            ) || 0;

                        let lcAmount =
                            parseInt(
                                jQuery(htmlDoc)
                                    .find(
                                        '#attack_info_att_units tr:eq(1) td.unit-item-light'
                                    )
                                    .text()
                                    .trim()
                            ) || 0;

                        let [looted, estimated] = hauledResources.split('/');

                        looted = parseInt(looted?.replace('.', '')) || 0;
                        estimated = parseInt(estimated?.replace('.', '')) || 0;

                        const reportInfo = {
                            looted: looted,
                            estimated: estimated,
                            hauledWood: hauledWood,
                            hauledClay: hauledClay,
                            hauledIron: hauledIron,
                            lcAmount: lcAmount,
                        };

                        farmingData.push(reportInfo);
                    }
                },
                function () {
                    const {
                        totalLooted,
                        totalEstimated,
                        totalWoodHauled,
                        totalClayHauled,
                        totalIronHauled,
                        totalLCAmount,
                        farmingEfficiency,
                        avgHauledLoot,
                        avgEstimated,
                        avgHauledWood,
                        avgHauledClay,
                        avgHauledIron,
                        avgLCSent,
                    } = doFarmingCalculations(farmingData);

                    const content = `
                        <div class="ra-mb15">
                            <table class="ra-table ra-table-v3" width="100%">
                                <tbody>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Farmed Villages'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                farmingData.length
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Farming Efficiency'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${farmingEfficiency}%
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ra-mb15">
                            <table class="ra-table ra-table-v3" width="100%">
                                <tbody>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt('Total Looted')}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(totalLooted)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Total Estimated'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                totalEstimated
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Total Wood Hauled'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                totalWoodHauled
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Total Clay Hauled'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                totalClayHauled
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Total Iron Hauled'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                totalIronHauled
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="ra-mb15">
                            <table class="ra-table ra-table-v3" width="100%">
                                <tbody>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt('Average Loot')}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                avgHauledLoot
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Average Estimated Loot'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                avgEstimated
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Average Hauled Wood'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                avgHauledWood
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Average Hauled Clay'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                avgHauledClay
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <b>${twSDK.tt(
                                                'Average Hauled Iron'
                                            )}</b>
                                        </td>
                                        <td>
                                            ${twSDK.formatAsNumber(
                                                avgHauledIron
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;

                    const customStyle = `
                        #${scriptConfig.scriptData.prefix} .ra-table-v3 td { width: 60% !important; }
                    `;

                    twSDK.renderFixedWidget(
                        content,
                        scriptConfig.scriptData.prefix,
                        'ra-farm-efficiency-calculator',
                        customStyle
                    );
                },
                function (error) {
                    UI.ErrorMessage(
                        twSDK.tt(
                            'There was an error while fetching the report data!'
                        )
                    );
                    console.error(`${scriptInfo} Error: `, error);
                }
            );
        }

        // Helper: Do farming calculations
        function doFarmingCalculations(farmingData) {
            let totalLooted = 0;
            let totalEstimated = 0;
            let totalWoodHauled = 0;
            let totalClayHauled = 0;
            let totalIronHauled = 0;
            let totalLCAmount = 0;

            farmingData.forEach((item) => {
                const {
                    looted,
                    estimated,
                    hauledWood,
                    hauledClay,
                    hauledIron,
                    lcAmount,
                } = item;
                totalLooted += looted;
                totalEstimated += estimated;
                totalWoodHauled += hauledWood;
                totalClayHauled += hauledClay;
                totalIronHauled += hauledIron;
                totalLCAmount += lcAmount;
            });

            const farmingEfficiency = (
                (totalLooted / totalEstimated) *
                100
            ).toFixed(2);
            const avgHauledLoot = parseInt(totalLooted / farmingData.length);
            const avgEstimated = parseInt(totalEstimated / farmingData.length);
            const avgHauledWood = parseInt(
                totalWoodHauled / farmingData.length
            );
            const avgHauledClay = parseInt(
                totalClayHauled / farmingData.length
            );
            const avgHauledIron = parseInt(
                totalIronHauled / farmingData.length
            );
            const avgLCSent = parseInt(totalLCAmount / farmingData.length);

            return {
                totalLooted,
                totalEstimated,
                totalWoodHauled,
                totalClayHauled,
                totalIronHauled,
                totalLCAmount,
                farmingEfficiency,
                avgHauledLoot,
                avgEstimated,
                avgHauledWood,
                avgHauledClay,
                avgHauledIron,
                avgLCSent,
            };
        }

        // Helper: Get all report IDs
        function getReportUrls() {
            const reportUrls = [];

            jQuery('#report_list tbody tr').each(function () {
                const reportUrl = jQuery(this)
                    .find('.report-link')
                    .attr('href');
                if (typeof reportUrl !== 'undefined' && reportUrl !== '') {
                    reportUrls.push(reportUrl);
                }
            });

            return reportUrls;
        }
    }
);
