import React, { Component } from 'react';
import { Layout, Table, Card, Col, Row, Popover, Button, Icon, Input } from 'antd';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
    withRouter,
} from 'react-router-dom';
import {getAllLinks} from "../../../util/APIUtils";
import './Mylinks.css'
import {notification} from "antd/lib/index";

const { Content } = Layout;

/** Component class that renders table containing SYL links */
class LinksTable extends Component {
    /** Constructor that sets initial component state at mount time */
    constructor(props) {
        super(props);
        this.state = {
            filterDropdownVisible: false,
            data: this.props.links,
            searchText: '',
            filtered: false,
        };
    }

    /** Callback function that gets called when search input changes */
    onInputChange = (e) => {
        this.setState({ searchText: e.target.value });
    }

    /** Callback function that gets called when user clicks on search button */
    onSearch = () => {
        const { searchText } = this.state;
        const reg = new RegExp(searchText, 'gi');
        this.setState({
            filterDropdownVisible: false,
            filtered: !!searchText,
            data: this.props.links.map((record) => {
                const match = record.merchantName.match(reg);
                if (!match) {
                    return null;
                }
                return {
                    ...record,
                    merchantName: (
                        <span>
              {record.merchantName.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((text, i) => (
                  text.toLowerCase() === searchText.toLowerCase() ?
                      <span key={i} className="highlight">{text}</span> : text // eslint-disable-line
              ))}
            </span>
                    ),
                };
            }).filter(record => !!record),
        });
    }

    render() {
        const columns = [{
            title: "Retailer",
            dataIndex: "merchantName",
            key: "merch",
            width: "25%",
            filterDropdown: (
                <div className="links-filter-dropdown">
                    <Input
                        ref={ele => this.searchInput = ele}
                        placeholder="Search retailer"
                        value={this.state.searchText}
                        onChange={this.onInputChange}
                        onPressEnter={this.onSearch}
                    />
                    <Button type="primary" onClick={this.onSearch}>Search</Button>
                </div>
            ),
            filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
            filterDropdownVisible: this.state.filterDropdownVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterDropdownVisible: visible,
                }, () => this.searchInput && this.searchInput.focus());
            },
        },{
            title: "Earning",
            dataIndex: "earnings",
            key: "earnings",
            width: "23%",
            sorter: (a, b) => a.earnings - b.earnings,
        },{
            title: 'Click',
            dataIndex: 'redirects',
            key: 'clicks',
            width: '19%',
            sorter: (a, b) => a.redirects - b.redirects
        },{
            title: 'Date',
            dataIndex: 'creationDate',
            key: 'date',
            width: '20%'
        }]
        return <Table
            expandRowByClick={true}
            expandedRowRender={record =>
                <Popover content={
                    <CopyToClipboard
                        onCopy={this.props.onCopy}
                        text={record.link}>
                        <Button type={'primary'}>Copy to Clipboard</Button>
                    </CopyToClipboard>}
                         title={"Press the button to copy your SYL link"}
                         trigger={'click'}>
                    <a>{record.link}</a>
                </Popover>}
            rowKey={record => record.hash}
            columns={columns}
            dataSource={this.state.data} size={'small'}/>;
    }


}





/** Component class that renders the mylinks page */
class Mylinks extends Component {
    /** Constructor that initialized component states at mount time */
   constructor(props){
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
       this.onCopy = this.onCopy.bind(this);
   }
    componentWillMount() {
        this.loadLinks(0,30,false);
    }
    /** Callback function that gets called when user clicks on copy to clipboard button. Notifies operation successfulness */
    onCopy() {
        notification.success({
            message: 'SYL App',
            description: "Copied link to clipboard!",
        });
    }

    /**
     * Callback function that gets called at component mount time. Try to load user's SYL links from backend if
     * they are not already loaded in browser storage, and retrieve links to store in this.state.links
     * @param {number} page - page number of pagination response from backend server
     * @param {number} size - number of links for each pagination response
     * @param {bool} update - if true, load links from server, else load links from browser storage
     * */
    loadLinks(page = 0, size = 30, update = true){
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
        let promise;
        promise = getAllLinks(page,size);
        if (!promise) {
            return;
        }

        this.setState({isLoading: true});
        promise
            .then(response => {
                console.log(response);
                response.content.forEach((row) => {
                    let date = new Date(row.creationDate);
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
            this.loadLinks(this.page + 1);
        } else {
            this.setState({
                isLoading: false
            });
        }
    }
    render() {
        return (
            <Layout className="mylinks-layout" style={{ padding: '0', background: '#ECECEC' }}>
                <Content className="mylinks-content" >
                    <div className="content-container" style={{ background: '#ECECEC', padding: '0' }}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Card className="link-table" title="Your links">
                                    <LinksTable onCopy={this.onCopy} links={this.state.links}/>
                                    {/*<Table expandRowByClick={true}*/}
                                           {/*expandedRowRender={record =>*/}
                                               {/*<Popover content={*/}
                                                   {/*<CopyToClipboard*/}
                                                       {/*onCopy={this.onCopy}*/}
                                                       {/*text={record.link}>*/}
                                                       {/*<Button type={'primary'}>Copy to Clipboard</Button>*/}
                                                   {/*</CopyToClipboard>}*/}
                                                        {/*title={"Press the button to copy your SYL link"}*/}
                                                        {/*trigger={'click'}>*/}
                                                   {/*<a>{record.link}</a>*/}
                                               {/*</Popover>}*/}
                                           {/*rowKey={record => record.hash}*/}
                                           {/*dataSource={dataSource}*/}
                                           {/*columns={columns} size="small"/>*/}
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Content>
            </Layout>
        )
    }
}

export default withRouter(Mylinks);