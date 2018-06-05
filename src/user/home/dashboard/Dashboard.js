import React, { Component } from 'react';
import { Layout, Table, Card, Col, Row, Popover, Button } from 'antd';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
    withRouter
} from 'react-router-dom';
import { getAllLinks } from "../../../util/APIUtils";
import LoadingIndicator from "../../../common/LoadingIndicator";
import './Dashboard.css'
import {notification} from "antd/lib/index";
const { Content } = Layout;

/** Component class that renders the dashboard page */
class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            links: [],
            page: 0,
            size: 5,
            totalElements: 0,
            totalPages: 0,
            last: true,
            isLoading: false
        };
        notification.config({
            placement: 'topRight',
            top: 70,
            duration: 3,
        });
        this.loadLinks = this.loadLinks.bind(this);
    }

    componentWillMount() {
        this.loadLinks(0,30,false);
    }

    /**
     * Callback function that gets called at component mount time. Try to load user's SYL links from backend if
     * they are not already loaded in browser storage, and retrieve links to store in this.state.links
     * @param {number} page - page number of pagination response from backend server
     * @param {number} size - number of links for each pagination response
     * @param {bool} update - if true, load links from server, else load links from browser storage
     * */
    loadLinks(page = 0, size = 30, update = true){
        let promise;
        if ('mylinks' in localStorage && !update) {
            let mylinks = JSON.parse(localStorage.getItem('mylinks'));
            console.log(localStorage.getItem('mylinks'));
            this.setState({
                links: mylinks,
                totalElements: parseInt(localStorage.getItem('totalElements'),10),
                totalPages: parseInt(localStorage.getItem('totalPages'),10)

            });
            return;
        }else {
            this.setState({
                links: [],
                totalElements: 0,
                totalPages: 0,
                last: true
            });
        }
        promise = getAllLinks(page,size);
        if (!promise) {
            return;
        }

        this.setState({isLoading: true});
        promise
            .then(response => {
                response.content.forEach((row) => {
                    date = new Date(row.creationDate);
                    row.creationDate = date.toDateString()});
                this.setState({
                    links: this.state.links.concat(response.content),
                    page: response.page,
                    size: response.size,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages,
                    last: response.last,
                });
                if (this.state.last) {
                    localStorage.setItem('mylinks', JSON.stringify(this.state.links));
                    localStorage.setItem('totalPages',this.state.totalPages.toString());
                    localStorage.setItem('totalElements', this.state.totalElements.toString());
                }
            }).catch(error => {
                this.setState({
                    isLoading: false,
                    last: true
                })
        });
        if (!this.state.last) {
            this.loadLinks(this.state.page + 1);
        } else {
            this.setState({
                isLoading: false
            });
        }
        console.log(this.state.links);
    }

    /** Callback function that gets called after user clicks on the copy to clipboard button */
    onCopy() {
        notification.success({
            message: 'SYL App',
            description: "Copied link to clipboard!",
        });
    }

    render() {
        let totalEarning = 0, totalClicks = 0;
        this.state.links.forEach(function (elem) {
           totalEarning += elem.earnings;
           totalClicks += elem.redirects;
        });
        console.log(this.state.links);
        this.state.links.slice(0,5).forEach((row) => {row.creationDate = row.creationDate.substr(0,10);});
        const dataSource = this.state.links.slice(0,5);
        const columns = [{
            title: 'Retailer',
            dataIndex: 'merchantName',
            key: 'merch',
            width: '24%'
        },{
            title: 'Earning',
            dataIndex: 'earnings',
            key: 'earnings',
            width: '22%'
        },{
            title: 'Click',
            dataIndex: 'redirects',
            key: 'clicks',
            width: '20%'
        },{
            title: 'Date',
            dataIndex: 'creationDate',
            key: 'date',
            width: '22%'
        }];
        return (
            <Layout className='dash-layout' style={{ padding: '0', background: '#ECECEC' }}>
                <Content className='dash-content' >
                    {
                        this.state.isLoading? (<LoadingIndicator />) :
                            (<div className="content-container" style={{ background: '#ECECEC', padding: '0' }}>
                                <Row gutter={16} style={{ marginBottom: 8 }}>
                                    <Col span={24}>
                                        <Card hoverable={true}
                                              className="earning-card"
                                              title={<span style={{fontSize: '2em'}}>Total earnings</span>}>
                                            <span style={{fontSize: 'large'}}>${totalEarning}.00</span>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginBottom: 8 }}>
                                    <Col span={24}>
                                        <Card hoverable={true}
                                              className="clicks-card"
                                              title={<span style={{fontSize: '2em'}}>Total clicks</span>}>
                                            <span style={{fontSize: 'large'}}>{totalClicks} clicks</span>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Card className="dash-table" title="Your recent links">
                                            <Table pagination={false}
                                                   expandRowByClick={true}
                                                   expandedRowRender={record =>
                                                       <Popover content={
                                                           <CopyToClipboard
                                                               onCopy={this.onCopy}
                                                               text={record.link}>
                                                               <Button type={'primary'}>Copy to Clipboard</Button>
                                                           </CopyToClipboard>}
                                                                title={"Press the button to copy your SYL link"}
                                                                trigger={'click'}>
                                                           <a>{record.link}</a>
                                                       </Popover>}
                                                   rowKey={record => record.hash}
                                                   dataSource={dataSource}
                                                   columns={columns}
                                                   size="small"/>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>)
                    }

                </Content>
            </Layout>
        )
    }

}

export default withRouter(Dashboard)