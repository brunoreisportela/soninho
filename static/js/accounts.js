"use strict";

var products = [];

function set_product(product_name, profit) {
    profit = parseFloat(profit);

    for (var i = 0; i < products.length; i++) {
        if (products[i]["name"] == product_name) {
            products[i]["profit"] += profit;
            return;
        }
    }


    var product = { "name": product_name, "profit": profit, "color": get_random_color() };

    products.push(product);
    // console.log(products);
}

function get_accounts() {
    $.get("https://taylor-api.quant4x.com/accounts", {
    }, function () {
    }).done(function (response) {

        var accounts_json = JSON.parse(response);

        // console.log(accounts_json);

        var html_items = "";

        for (var i = 0; i < accounts_json.length; i++) {

            var account = accounts_json[i];

            // console.log(account);

            var balance = parseFloat(account["balance"]);

            var profit_loss = parseFloat(account["profit_loss"]);

            var profit_loss_color = "green_label";

            if (profit_loss < 0) {
                profit_loss_color = "red_label";
            }

            var equity = parseFloat(account["equity"] - account["balance"]);

            var equity_color = "green_label";

            if (equity < 0) {
                equity_color = "red_label";
            }

            var week_balance = parseFloat(profit_loss + equity);

            var week_balance_color = "green_label";

            if (week_balance < 0) {
                week_balance_color = "red_label";
            }

            var closed_positions_color = "#0fac81";

            if( week_balance != profit_loss ){
                closed_positions_color = "#eb6459";
            }

            html_items += `
            
            <div class="col-md-6 col-lg-5 col-xxl-3">
                <div class="card card-bordered h-100">
                    <div class="card-inner">
                        <div class="card-title-group align-start pb-3 g-2">
                            <div class="card-title card-title-sm">
                                <h6 class="title">`+ account["product_name"] + `</h6>
                                <p>`+ account["account_id"] + `</p>
                            </div>
                            <div class="card-tools">
                                <span class="dot dot-lg sq" style="background:`+closed_positions_color+`;"></span> 
                                <em class="card-hint icon ni ni-help" data-toggle="tooltip" data-placement="left" title="`+ account["machine_name"] + ` / Position status. If green it is because there is no activity, red shows otherwise."></em>
                            </div>
                        </div>
                        <div class="analytic-au">
                            <div class="analytic-data-group analytic-au-group g-3">
                                <div class="analytic-data analytic-au-data">
                                    <div class="title">Balance</div>
                                    <div class="amount">`+ balance.toFixed(2) + `</div>
                                </div>

                                <div class="analytic-data analytic-au-data">
                                    <div class="title">Week Balance</div>
                                    <div class="amount `+ week_balance_color + `">` + week_balance.toFixed(2) + `</div>                                
                                </div>
                            </div>
                            <div class="analytic-ov-ck">
                                <canvas class="analytics-line-large" id="`+ account["account_id"] + `_chart"></canvas>
                            </div>                          
                        </div>
                    </div>
                </div>
            </div>            
            `
            }

            $("#card_content").html(html_items);

            set_line_chart_per_account(accounts_json);

            // set_pie_chart();

        })
        .fail(function (response) {
            // Swal.fire({text:response.statusText, icon:"error"});
            console.log(response);
        })
        .always(function (response) {
            // get_badges();
        });
}

function set_line_chart_per_account(accounts_json) {

    for (var j = 0; j < accounts_json.length; j++) {

        var account = accounts_json[j];

        // console.log( account);

        var history = account["history"];
        var labels = [];
        var profits = [];
        var profits_week = [];
        // var week_balances = [];

        var previous_profit = 0.0;

        for (var k = 0; k < history.length; k++) {
            labels.push(history[k]["end_scope"]);

            var profit = parseFloat(history[k]["profit_loss"].toFixed(2));
            var equity = parseFloat(history[k]["equity"] - history[k]["balance"]);

            // var week_balance = parseFloat(profit + equity);

            previous_profit += profit;

            profits.push(previous_profit);
            profits_week.push(profit);
            // week_balances.push(week_balance);

            set_product(account["product_name"], profit);
        }

        // console.log(profits);

        var analyticOvData = {
            labels: labels,
            dataUnit: 'People',
            lineTension: .1,
            datasets: [
                {
                    label: "Current Month",
                    color: "#3fbd9a",
                    dash: 0,
                    background: NioApp.hexRGB('#3fbd9a', .15),
                    data: profits
                },                
                {
                    label: "Current Month",
                    color: "#a5d0d0",
                    dash: [5],
                    background: "transparent",
                    data: profits_week
                }
            ]
        };

        var chart = document.getElementById(account["account_id"] + '_chart');
        var _get_data = analyticOvData;

        var selectCanvas = chart.getContext("2d");
        var chart_data = [];

        // console.log(selectCanvas);

        for (var i = 0; i < _get_data.datasets.length; i++) {
            chart_data.push({
                label: _get_data.datasets[i].label,
                tension: _get_data.lineTension,
                backgroundColor: _get_data.datasets[i].background,
                borderWidth: 2,
                borderDash: _get_data.datasets[i].dash,
                borderColor: _get_data.datasets[i].color,
                pointBorderColor: _get_data.datasets[i].color,
                pointBackgroundColor: _get_data.datasets[i].color,
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: _get_data.datasets[i].color,
                pointBorderWidth: 1,
                pointHoverRadius: 2,
                pointHoverBorderWidth: 1,
                pointRadius: 2,
                pointHitRadius: 2,
                data: _get_data.datasets[i].data
            });
        }

        var chart = new Chart(selectCanvas, {
            type: 'line',
            data: {
                labels: _get_data.labels,
                datasets: chart_data
            },
            options: {
                legend: {
                    display: _get_data.legend ? _get_data.legend : false,
                    rtl: NioApp.State.isRTL,
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        fontColor: '#6783b8'
                    }
                },
                maintainAspectRatio: false,
                tooltips: {
                    enabled: true,
                    rtl: NioApp.State.isRTL,
                    callbacks: {
                        title: function title(tooltipItem, data) {
                            return data['labels'][tooltipItem[0]['index']];
                        },
                        label: function label(tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem['index']];
                        }
                    },
                    backgroundColor: '#fff',
                    borderColor: '#eff6ff',
                    borderWidth: 2,
                    titleFontSize: 13,
                    titleFontColor: '#6783b8',
                    titleMarginBottom: 6,
                    bodyFontColor: '#9eaecf',
                    bodyFontSize: 12,
                    bodySpacing: 4,
                    yPadding: 10,
                    xPadding: 10,
                    footerMarginTop: 0,
                    displayColors: false
                },
                scales: {
                    yAxes: [{
                        display: true,
                        position: NioApp.State.isRTL ? "right" : "left",
                        ticks: {
                            beginAtZero: true,
                            fontSize: 12,
                            fontColor: '#9eaecf',
                            padding: 8,
                            stepSize: 2400
                        },
                        gridLines: {
                            color: NioApp.hexRGB("#526484", .2),
                            tickMarkLength: 0,
                            zeroLineColor: NioApp.hexRGB("#526484", .2)
                        }
                    }],
                    xAxes: [{
                        display: false,
                        ticks: {
                            fontSize: 12,
                            fontColor: '#9eaecf',
                            source: 'auto',
                            padding: 0,
                            reverse: NioApp.State.isRTL
                        },
                        gridLines: {
                            color: "transparent",
                            tickMarkLength: 0,
                            zeroLineColor: 'transparent',
                            offsetGridLines: true
                        }
                    }]
                }
            }
        });

    }
}

function get_random_color(){
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal; 
    randomNumber = Math.floor(randomNumber);
    let randColor = randomNumber.toString(16);
    return "#"+randColor;
}

function set_pie_chart() {

    var labels = [];
    var data = [];
    var backgrounds = [];

    // var products_li = "";

    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        labels.push(product["name"]);
        data.push(product["profit"]);
        backgrounds.push(product["color"]);

        // products_li += `
        //     <li>
        //         <div class="title">
        //             <div class="mr-2" style="background-color: `+product["color"]+`; width:16px; height: 16px;">&nbsp;</div>
        //             <span>`+product["name"]+`</span>
        //         </div>
        //         <div class="amount amount-xs"> $`+product["profit"].toFixed(2)+`</div>
        //     </li>
        // `;
    }

    // $("#products-legend").html(products_li);

    var trafficSources = {
        labels: labels,
        dataUnit: 'People',
        legend: false,
        datasets: [{
            borderColor: "#fff",
            background: backgrounds,
            data: data
        }]
    };

    // console.log(backgrounds);

    var chart = document.getElementById("products-doughnut");
    var selectCanvas = chart.getContext("2d");
    var chart_data = [];

    for (var i = 0; i < trafficSources.datasets.length; i++) {
        chart_data.push({
            backgroundColor: trafficSources.datasets[i].background,
            borderWidth: 0,
            borderColor: trafficSources.datasets[i].borderColor,
            hoverBorderColor: trafficSources.datasets[i].borderColor,
            data: trafficSources.datasets[i].data
        });
    }

    var chart = new Chart(selectCanvas, {
        type: 'bar',
        data: {
            labels: trafficSources.labels,
            datasets: chart_data
        },
        options: {
            legend: {
                display: trafficSources.legend ? trafficSources.legend : false,
                rtl: NioApp.State.isRTL,
                labels: labels
            },
            rotation: -1.5,
            cutoutPercentage: 10,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    position: NioApp.State.isRTL ? "right" : "left",
                    ticks: {
                        beginAtZero: true,
                        fontSize: 12,
                        fontColor: '#9eaecf',
                        padding: 8,
                        stepSize: 2400
                    },
                    gridLines: {
                        color: NioApp.hexRGB("#526484", .2),
                        tickMarkLength: 0,
                        zeroLineColor: NioApp.hexRGB("#526484", .2)
                    }
                }]},
            tooltips: {
                enabled: true,
                rtl: NioApp.State.isRTL,
                callbacks: {
                    title: function title(tooltipItem, data) {
                        return data['labels'][tooltipItem[0]['index']];
                    },
                    label: function label(tooltipItem, data) {
                        return ' $'+parseFloat(data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem['index']]).toFixed(2);
                    }
                },
                backgroundColor: '#1c2b46',
                titleFontSize: 13,
                titleFontColor: '#fff',
                titleMarginBottom: 6,
                bodyFontColor: '#fff',
                bodyFontSize: 12,
                bodySpacing: 4,
                yPadding: 10,
                xPadding: 10,
                footerMarginTop: 0,
                displayColors: false
            }
        }
    });

}

get_accounts();