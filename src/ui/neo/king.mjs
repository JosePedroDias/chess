import m from '../../../vendor/mithril.mjs';

import { CW, STROKE_WIDTH } from '../constants.mjs';
import { BLACK, WHITE } from '../colors.mjs';

export function King({ isWhite }, { pos }) {
    const fill = isWhite ? WHITE : BLACK;
    const stroke = isWhite ? BLACK : WHITE;

    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('g',
        {
            transform: `translate(${x}, ${y})`,
            style: `fill:${fill}; stroke:${stroke}; stroke-width:${STROKE_WIDTH}; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4`,
        },
        [
            m('title', `${isWhite ? 'white' : 'black'} king`),
            m('path', {
                d: `m 20.92609,5.7401401 c -0.19632,-10e-4 -0.34664,0.19172 -0.32161,0.38193 0,0.76131 0,1.52263 0,2.28395 -0.79459,0.002 -1.5894,-0.003 -2.38385,0.004 -0.17981,0.0221 -0.30409,0.20116 -0.28282,0.37724 0.002,0.9920999 -0.003,1.9844999 0.002,2.9764099 0.0137,0.1804 0.19523,0.3082 0.37052,0.28345 0.74195,-0.002 1.48389,-0.004 2.22583,-0.006 -0.22795,0.99826 -0.4559,1.99653 -0.68385,2.99479 -1.67456,-0.7328 -3.50015,-1.11114 -5.32672,-1.12991 -1.45552,-0.002 -2.93087,0.39174 -4.12897,1.23383 -1.1380904,0.78755 -1.9867304,1.96108 -2.4358604,3.26559 -0.37346,1.08389 -0.53007,2.25122 -0.39899,3.3929 0.13701,1.20992 0.63142,2.35965 1.33016,3.34996 0.5004004,0.72067 1.1066804,1.35877 1.7328704,1.97031 0.82601,0.83081 1.64557,1.66888 2.43402,2.53554 0.3482,0.40146 0.67547,0.85593 0.96365,1.31618 0.0981,0.15626 0.19178,0.31529 0.28817,0.47263 0.48699,-0.0804 0.98158,-0.1572 1.46191,-0.21496 0.804,-0.10177 1.6462,-0.1619 2.45633,-0.20729 0.76356,-0.0442 1.52723,-0.0763 2.28583,-0.0956 1.40617,-0.0376 2.8134,-0.0324 4.21937,0.0113 0.55034,0.0185 1.12081,0.0416 1.67841,0.0731 0.56369,0.0306 1.13459,0.0681 1.70402,0.11422 0.79865,0.105 1.59729,0.21004 2.39595,0.31501 0.62448,-1.00566 1.34392,-1.95805 2.1997,-2.77914 1.18014,-1.18004 2.42704,-2.31773 3.37388,-3.70322 0.70817,-1.03372 1.16883,-2.24879 1.24266,-3.50451 0.0753,-1.19853 -0.16581,-2.40712 -0.63044,-3.51068 -0.38556,-0.8959 -0.95639,-1.72178 -1.70976,-2.34715 -0.9436,-0.8193 -2.10814,-1.38944 -3.34427,-1.59015 -0.97561,-0.1681 -1.97268,-0.0986 -2.9494,0.0216 -1.27677,0.16846 -2.53189,0.51975 -3.69929,1.06588 -0.2303,-1.01562 -0.4606,-2.03125 -0.69089,-3.04687 0.7621,-0.002 1.52461,0.004 2.28646,-0.003 0.20501,-0.0178 0.34751,-0.22796 0.31849,-0.4263 -0.002,-0.97601 0.004,-1.95225 -0.003,-2.9281199 -0.0211,-0.18533 -0.20938,-0.30567 -0.38771,-0.28128 -0.75869,-4.3e-4 -1.51739,-8.6e-4 -2.27609,-10e-4 -0.002,-0.79416 0.004,-1.58854 -0.003,-2.38255 -0.0221,-0.17981 -0.20116,-0.30408 -0.37724,-0.28281 -0.97901,5.2e-4 -1.95811,-0.001 -2.93708,7.8e-4 z M 28.66385,19.21435 c 0.69028,0.006 1.42029,0.19634 1.91836,0.69919 0.43257,0.44361 0.64975,1.09022 0.57874,1.70516 -0.0809,0.64777 -0.45025,1.21401 -0.85986,1.70477 -0.0675,0.0825 -0.16581,0.18998 -0.24687,0.28073 -0.92315,0.96366 -1.8305,1.94284 -2.70417,2.95182 -0.66632,-0.0356 -1.33264,-0.0712 -1.99896,-0.10677 0,-1.95868 0,-3.91736 0,-5.87604 0.90035,-0.81504 2.08376,-1.36652 3.31276,-1.35886 z m -12.46718,0.002 c 0.29663,-5.3e-4 0.59302,0.0302 0.88359,0.0896 0.0428,0.01 0.13985,0.0304 0.20261,0.0469 0.83081,0.21259 1.58931,0.66042 2.22161,1.23438 0,1.95355 0,3.90711 0,5.86067 -0.66988,0.0366 -1.33976,0.0733 -2.00963,0.1099 -0.8002,-0.92949 -1.62993,-1.83354 -2.48151,-2.71589 -0.34512,-0.36668 -0.69624,-0.76955 -0.96511,-1.20937 -0.0495,-0.0832 -0.0899,-0.154 -0.13738,-0.24869 -0.17044,-0.32273 -0.25615,-0.68847 -0.23227,-1.05356 0.0119,-0.60668 0.2891,-1.2113 0.77683,-1.58084 0.49014,-0.38578 1.12704,-0.5348 1.74126,-0.53306 z m 5.97109,12.05156 c -1.76688,0.0105 -3.53417,0.0728 -5.29565,0.21291 -0.71032,0.0637 -1.42037,0.14748 -2.12291,0.26773 -0.34913,0.12578 -0.72671,0.14712 -1.07697,0.27171 -0.71494,0.22134 -1.36215,0.68475 -1.75464,1.32772 -0.33267,0.5244 -0.496,1.13768 -0.55264,1.75167 -0.0739,0.73493 -0.0595,1.47533 -0.043,2.21253 0.0229,0.17934 0.20674,0.29486 0.3799,0.2711 7.16744,-6.7e-4 14.33501,10e-4 21.50239,-0.001 0.19929,-0.008 0.3512,-0.2059 0.32597,-0.40047 0.003,-0.70296 -0.007,-1.40718 -0.0629,-2.10807 -0.0753,-0.7954 -0.33245,-1.60785 -0.89695,-2.19416 -0.43288,-0.4633 -1.02241,-0.74555 -1.62741,-0.90925 -0.46838,-0.13996 -0.94587,-0.25032 -1.43154,-0.30921 -1.20506,-0.178 -2.42108,-0.2666 -3.63754,-0.31728 -1.23451,-0.0556 -2.47028,-0.0807 -3.70606,-0.0759 z`,
                stroke: 'none',
            }),
            m('path', {
                d: `m 22.1675,31.00133 c -1.87373,0.0139 -3.74846,0.0769 -5.61533,0.24176 -0.63191,0.0641 -1.26434,0.1379 -1.88883,0.25303 -0.38477,0.13018 -0.79703,0.15724 -1.17702,0.30497 -0.80388,0.27268 -1.51005,0.84334 -1.90752,1.59789 -0.34747,0.63101 -0.47467,1.35498 -0.51007,2.06716 -0.0385,0.63112 -0.0304,1.26496 -0.009,1.89613 0.0439,0.31459 0.37341,0.53036 0.68031,0.48776 7.1634,-4e-4 14.32697,0.002 21.49026,-0.002 0.34415,-0.0171 0.61034,-0.36465 0.56636,-0.70089 -9.3e-4,-0.76675 -0.004,-1.53594 -0.0873,-2.29888 -0.10584,-0.82783 -0.42404,-1.65799 -1.03613,-2.24398 -0.48695,-0.47807 -1.13674,-0.75937 -1.78433,-0.92692 -0.5337,-0.1583 -1.08317,-0.25308 -1.63488,-0.32148 -1.75031,-0.23588 -3.51797,-0.29741 -5.28177,-0.33977 -0.60159,-0.0117 -1.20331,-0.0165 -1.80501,-0.0144 z`,
                fill: `none`,
            }),
            m('path', {
                d: `m 16.08182,19.48493 c -0.64987,0.0149 -1.33708,0.24028 -1.75449,0.76242 -0.36443,0.46385 -0.46902,1.10771 -0.3185,1.67238 0.18089,0.55216 0.55384,1.01405 0.93053,1.446 0.49402,0.54355 1.01375,1.063 1.50531,1.60891 0.39505,0.43101 0.78357,0.86787 1.16606,1.31003 0.54236,-0.0297 1.08472,-0.0594 1.62708,-0.0891 0,-1.82934 0,-3.65868 0,-5.48802 -0.86467,-0.76021 -1.98967,-1.26387 -3.15599,-1.22265 z`,
                fill: `none`,
            }),
            m('path', {
                d: `m 28.47557,19.48441 c -1.05803,0.0474 -2.06627,0.52051 -2.85781,1.21015 0,1.83394 0,3.66788 0,5.50182 0.53906,0.0287 1.07812,0.0575 1.61719,0.0862 0.86553,-0.99896 1.76999,-1.96337 2.67957,-2.92218 0.12942,-0.14139 0.26337,-0.30313 0.36885,-0.44261 0.35619,-0.46911 0.65809,-1.03392 0.6214,-1.64017 -0.0382,-0.61444 -0.38815,-1.21817 -0.94695,-1.49749 -0.45182,-0.24102 -0.97555,-0.31502 -1.48225,-0.29572 z`,
                fill: `none`,
            }),
            m('path', {
                d: `m 23.8774,5.4711301 c -1.00611,0.006 -2.01272,-0.004 -3.01875,0.006 -0.32318,0.0343 -0.56266,0.36318 -0.52084,0.68083 v 1.98167 c -0.72141,0.003 -1.44373,-0.006 -2.16458,0.008 -0.31464,0.0415 -0.54096,0.3646 -0.50209,0.67432 0.002,0.9923599 -0.005,1.9851499 0.005,2.9772399 0.0275,0.32225 0.35895,0.55937 0.67302,0.51451 0.61767,-0.002 1.23534,-0.003 1.85302,-0.005 -0.17943,0.78593 -0.35886,1.57187 -0.53828,2.35781 -1.68302,-0.68655 -3.50326,-1.03622 -5.32072,-1.02505 -1.52947,0.03 -3.07002,0.49242 -4.29601,1.42261 -1.2047504,0.90356 -2.0656804,2.22954 -2.4707704,3.67457 -0.41389,1.43246 -0.45873,2.99408 0.0122,4.41873 0.41196,1.28328 1.19018,2.41856 2.1072604,3.3941 0.51462,0.54835 1.06036,1.06639 1.5817,1.60836 0.56748,0.58485 1.13629,1.16944 1.67528,1.78075 0.46919,0.55396 0.85302,0.90547 1.2236,1.52775 1.12733,-0.19243 2.26322,-0.33744 3.40508,-0.40696 0.80933,-0.0525 1.65078,-0.0964 2.46529,-0.12208 1.55968,-0.0512 3.12093,-0.0513 4.68067,-0.003 0.53738,0.018 1.09483,0.041 1.63951,0.0712 0.6059,0.0358 1.22188,0.0671 1.82926,0.12863 0.81718,0.10755 1.63438,0.21485 2.45154,0.32255 0.65127,-1.06328 1.40348,-1.8057 2.30968,-2.66621 1.20356,-1.20072 2.47081,-2.36497 3.41797,-3.78909 0.77056,-1.15856 1.2345,-2.53524 1.23335,-3.93254 0.007,-1.23663 -0.28978,-2.47031 -0.82533,-3.58299 C 36.36587,16.6365 35.77161,15.86896 35.02775,15.278 33.9862,14.41404 32.69739,13.84488 31.3505,13.69172 c -1.00387,-0.1172 -2.01901,-0.0282 -3.01505,0.11679 -1.08263,0.16868 -2.14613,0.46861 -3.1512,0.90616 l -0.54479,-2.40365 c 0.66782,-0.003 1.33661,0.008 2.00382,-0.008 0.34056,-0.0401 0.58143,-0.39556 0.53368,-0.72762 -0.002,-0.97518 0.006,-1.95097 -0.005,-2.9257599 -0.035,-0.31946 -0.36334,-0.55094 -0.67573,-0.51086 l -1.98563,-10e-4 c -0.003,-0.72106 0.007,-1.44313 -0.007,-2.16354 -0.0404,-0.29687 -0.32969,-0.5202 -0.62552,-0.50365 z`,
                fill: `none`,
            }),
        ]
    );
}