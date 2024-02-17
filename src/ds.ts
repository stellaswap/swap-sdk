import axios from 'axios'

const BASE_ROUTER_URL = 'https://router-api.stellaswap.com/api/v2/'

const getQuote = (body: any) => {
    return axios.get(
        BASE_ROUTER_URL +
        'quote' +
        '/' +
        body.token0Addr +
        '/' +
        body.token1Addr +
        '/' +
        body.amountIn +
        '/' +
        body.account +
        '/' +
        body.slippage
    )
}

export default {
    getQuote
}