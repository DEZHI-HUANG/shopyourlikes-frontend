import React, { Component } from 'react';
import { Layout, Card, Col, Row } from 'antd';
import { Chart, Axis, Geom, Tooltip, Coord, Legend, Label } from 'bizcharts';
import { DataView } from '@antv/data-set';
import './Stats.css'
import {getAllLinks} from "../../../util/APIUtils";
const { Content } = Layout;

/** Component class that renders the statistics page */
class Stats extends Component {

    constructor(props){
        super(props);
        this.links = [];
        this.last = true;
        this.page = 0;
        this.merchPieChart = [];
    }

    /**
     * Callback function that gets called at component mount time. Try to load user's SYL links from backend if
     * they are not already loaded in browser storage, and retrieve links to store in this.state.links
     * @param {number} page - page number of pagination response from backend server
     * @param {number} size - number of links for each pagination response
     * @param {bool} update - if true, load links from server, else load links from browser storage
     * */
    loadLinks(page = 0, size = 30){
        if ('mylinks' in localStorage) {
            let mylinks = JSON.parse(localStorage.getItem('mylinks'));
            console.log(localStorage.getItem('mylinks'));
            this.links = mylinks;
            return;
        }
        let promise;
        promise = getAllLinks(page,size);
        if (!promise) {
            return;
        }

        promise
            .then(response => {
                response.content.forEach((row) => {
                    date = new Date(row.creationDate);
                    row.creationDate = date.toDateString()});
                this.links = this.links.concat(response.content);
                this.page = response.page;
                this.last = response.last;
                if (response.last) {
                    localStorage.setItem('mylinks', JSON.stringify(this.links));
                    localStorage.setItem('totalPages',response.totalPages.toString());
                    localStorage.setItem('totalElements', response.totalElements.toString());
                }
            }).catch(error => {
            this.last = true;
        });
        if (!this.last) {
            this.loadLinks(this.page + 1);
        }
    }

    componentWillMount() {
        this.loadLinks(0,30);
    }




    render() {
        let earningByMerch = {}, clickByMerch = {};
        console.log(this.links);
        this.links.forEach((record) => {
            if(record.merchantName in earningByMerch){
                earningByMerch[record.merchantName] += record.earnings;
                clickByMerch[record.merchantName] += record.redirects;
            }else {
                earningByMerch[record.merchantName] = record.earnings;
                clickByMerch[record.merchantName] = record.redirects;
            }
        });
        let earningData = [], clickData = [];
        Object.keys(earningByMerch).forEach((key) => {
            if (earningByMerch[key] !== 0) {
                earningData.push({item: key, count: earningByMerch[key]});
            }
            if (clickByMerch[key] !== 0) {
                clickData.push({item: key, count: clickByMerch[key]});
            }
        });
        // const data = [
        //     { item: '事例一', count: 40 },
        //     { item: '事例二', count: 21 },
        //     { item: '事例三', count: 17 },
        //     { item: '事例四', count: 13 },
        //     { item: '事例五', count: 9 }
        // ];
        const dv = new DataView();
        dv.source(earningData).transform({
            type: 'percent',
            field: 'count',
            dimension: 'item',
            as: 'percent'
        });
        const cols = {
            percent: {
                formatter: val => {
                    val = (val * 100).toFixed(2) + '%';
                    return val;
                }
            }
        };
        const dv2 = new DataView();
        dv2.source(clickData).transform({
            type: 'percent',
            field: 'count',
            dimension: 'item',
            as: 'percent'
        });
        const cols2 = {
            percent: {
                formatter: val => {
                    val = (val * 100).toFixed(2) + '%';
                    return val;
                }
            }
        };
        return(
            <Layout className="stats-layout" style={{ padding: '0', background: '#ECECEC' }}>
                <Content className='stats-content' >
                    <div className="content-container" style={{ background: '#ECECEC', padding: '0' }}>
                        <Row gutter={16} style={{ marginBottom: 8 }}>
                            <Col span={24}>
                                <Card title="Earning break down by retailers">
                                    <Chart width={300} height={350} data={dv} scale={cols} padding={[ 0 ]} forceFit>
                                        <Coord type='theta' radius={0.75} />
                                        <Axis name="percent" />
                                        <Legend position='bottom' offsetY={-window.innerHeight / 2 + 380} offsetX={0} />
                                        <Tooltip
                                            showTitle={false}
                                            itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
                                        />
                                        <Geom
                                            type="intervalStack"
                                            position="percent"
                                            color='item'
                                            tooltip={['item*percent',(item, percent) => {
                                                percent = (percent * 100).toFixed(2) + '%';
                                                return {
                                                    name: item,
                                                    value: percent
                                                };
                                            }]}
                                            style={{lineWidth: 1,stroke: '#fff'}}
                                        >
                                            <Label content='percent' offset={-40} textStyle={{
                                                rotate: 0,
                                                textAlign: 'center',
                                                shadowBlur: 2,
                                                shadowColor: 'rgba(0, 0, 0, .45)'
                                            }} />
                                        </Geom>
                                    </Chart>
                                </Card>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 8 }}>
                            <Col span={24}>
                                <Card title="Clicks break down by retailers">
                                    <Chart width={300} height={350} data={dv2} scale={cols2} padding={[ 0 ]} forceFit>
                                        <Coord type='theta' radius={0.75} />
                                        <Axis name="percent" />
                                        <Legend position='bottom' offsetY={-window.innerHeight / 2 + 380} offsetX={0} />
                                        <Tooltip
                                            showTitle={false}
                                            itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
                                        />
                                        <Geom
                                            type="intervalStack"
                                            position="percent"
                                            color='item'
                                            tooltip={['item*percent',(item, percent) => {
                                                percent = (percent * 100).toFixed(2) + '%';
                                                return {
                                                    name: item,
                                                    value: percent
                                                };
                                            }]}
                                            style={{lineWidth: 1,stroke: '#fff'}}
                                        >
                                            <Label content='percent' offset={-40} textStyle={{
                                                rotate: 0,
                                                textAlign: 'center',
                                                shadowBlur: 2,
                                                shadowColor: 'rgba(0, 0, 0, .45)'
                                            }} />
                                        </Geom>
                                    </Chart>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Content>
            </Layout>
        )
    }
}

export default Stats;