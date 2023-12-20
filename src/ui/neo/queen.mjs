import m from '../../../vendor/mithril.mjs';

import { CW, STROKE_WIDTH, SHOW_KEYS } from '../constants.mjs';
import { BLACK, WHITE } from '../colors.mjs';

export function Queen({ isWhite, id }, { pos }) {
    const fill = isWhite ? WHITE : BLACK;
    const stroke = isWhite ? BLACK : WHITE;

    const x = pos[0] * CW;
    const y = pos[1] * CW;

    return m('g.enter',
        {
            key: id,
            transform: `translate(${x}, ${y})`,
            style: `fill:${fill}; stroke:${stroke}; stroke-width:${STROKE_WIDTH}; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:4`,
            onbeforeremove(vnode) {
                vnode.dom.classList.add('leave');
                return new Promise((resolve) => vnode.dom.addEventListener('animationend', resolve));
            }
        },
        [
            m('title', `${isWhite ? 'white' : 'black'} queen`),
            SHOW_KEYS && m(
                'text',
                {
                    x: 0,
                    y: 0,
                    dy: CW,
                    style: `stroke:none; fill:${fill}; font-size:7px; font-weight:600`,
                },
                id,
            ),
            m('path', {
                d: `m 26.811304,6.7612794 c -0.8292,0.006 -1.65288,0.36442 -2.20277,0.98868 -0.72264,0.79439 -0.98471,1.9884 -0.62099,3.0042596 0.19722,0.56933 0.58223,1.06397 1.06283,1.42345 -0.91701,2.64288 -1.83402,5.28575 -2.75103,7.92863 -0.8111,-2.3121 -1.60519,-4.63014 -2.40918,-6.94472 -0.11369,-0.32841 -0.22738,-0.65681 -0.34108,-0.98521 0.68015,-0.48158 1.14941,-1.25812 1.22428,-2.09162 0.0975,-0.9279596 -0.2872,-1.8797396 -0.97585,-2.5036196 -0.44462,-0.41212 -1.00614,-0.70702 -1.61144,-0.78417 -0.85148,-0.11038 -1.76706,0.0847 -2.43434,0.64387 -0.93611,0.7655 -1.30389,2.11659 -0.95041,3.2634596 0.21986,0.75088 0.77099,1.3943 1.47994,1.72569 0.14068,0.0685 0.28742,0.12385 0.43632,0.17165 -0.14514,3.06623 -0.29028,6.13245 -0.43542,9.19868 -1.30652,-1.37776 -2.5949,-2.77259 -3.89322,-4.15807 0.36226,-0.53155 0.5983,-1.1752 0.53549,-1.82559 -0.0703,-0.81728 -0.52024,-1.58484 -1.18402,-2.06316 -0.43658,-0.33655 -0.96578,-0.56466 -1.5206,-0.59036 -0.8083904,-0.048 -1.6376904,0.25016 -2.2054104,0.83323 -0.76055,0.7375 -1.07938,1.92107 -0.72859,2.92937 0.26199,0.71717 0.75418,1.37479 1.44607,1.72308 0.29116,0.1509 0.60858,0.24736 0.93181,0.29942 1.6708404,4.01645 3.3381104,8.03452 5.0111904,12.04997 0.074,0.16361 0.27127,0.222 0.43646,0.17957 1.60875,-0.19455 3.21603,-0.31055 4.82954,-0.34564 1.07064,-0.0186 2.14131,-0.0444 3.21198,-0.056 1.37819,0.018 2.74907,0.0775 4.12442,0.18382 0.77709,0.0588 1.55001,0.13725 2.32777,0.2242 0.1726,0.0124 0.31741,-0.12263 0.36129,-0.28239 1.65838,-3.98529 3.31677,-7.97058 4.97515,-11.95586 0.19212,-0.0347 0.38819,-0.0573 0.56858,-0.13807 0.64839,-0.23528 1.21597,-0.70049 1.54016,-1.31311 0.34461,-0.61089 0.52332,-1.34324 0.35943,-2.03721 -0.13873,-0.61164 -0.50241,-1.15444 -0.95209,-1.58258 -0.51952,-0.45535 -1.19738,-0.7554 -1.89648,-0.73166 -0.8581,0.0246 -1.70726,0.42981 -2.23392,1.11373 -0.38286,0.4963 -0.66326,1.10136 -0.65859,1.73849 -0.004,0.58692 0.20383,1.16532 0.54714,1.63791 -1.30087,1.38732 -2.60173,2.77464 -3.9026,4.16197 -0.14767,-2.95489 -0.27695,-5.91067 -0.41671,-8.86594 -0.005,-0.10623 -0.01,-0.21245 -0.0148,-0.31868 0.87068,-0.24681 1.60001,-0.94485 1.87525,-1.8084 0.23947,-0.70566 0.26591,-1.5055896 -0.0448,-2.1942196 -0.23753,-0.54064 -0.64262,-0.99739 -1.11283,-1.34817 -0.52518,-0.3498 -1.16031,-0.5094 -1.78788,-0.49867 z`,
                stroke: `none`,
            }),
            m('path', {
                d: `m 21.669914,31.152629 c -1.701,0.01 -3.40299,0.0684 -5.09613,0.23828 -0.90382,0.0965 -1.81819,0.1676 -2.6938,0.42707 -0.58478,0.16451 -1.16395,0.40867 -1.61205,0.82988 -0.58119,0.52451 -0.89422,1.28878 -0.98173,2.05588 -0.0942,0.83137 -0.11806,1.67025 -0.0788,2.5059 0.0462,0.0697 0.0448,0.1896 0.1432,0.20483 0.14292,0.08 0.30925,0.0377 0.46549,0.048 7.08709,-5.4e-4 14.17426,0.001 21.2613,-8e-4 0.20001,4e-4 0.35388,-0.19314 0.33088,-0.3874 0.008,-0.84478 -6.7e-4,-1.69371 -0.11773,-2.5317 -0.11363,-0.74983 -0.46188,-1.48056 -1.0505,-1.972 -0.53876,-0.46405 -1.22788,-0.70662 -1.9171,-0.84008 -0.69524,-0.15087 -1.39569,-0.2889 -2.10698,-0.33437 -2.17639,-0.18743 -4.36196,-0.25708 -6.54609,-0.24355 z`,
                stroke: `none`,
            }),
            m('path', {
                d: `m 26.728234,6.4961794 c -0.94695,0.0291 -1.8756,0.48658 -2.45624,1.2388 -0.72304,0.90896 -0.92974,2.2166196 -0.46572,3.2893696 0.20261,0.48249 0.53008,0.90878 0.9303,1.24421 -0.81267,2.34209 -1.62534,4.68419 -2.43801,7.02628 -0.81668,-2.33923 -1.62166,-4.68246 -2.43411,-7.02316 0.72458,-0.58182 1.18292,-1.48882 1.18987,-2.42133 0.0203,-1.0242096 -0.48564,-2.0323796 -1.29642,-2.6529896 -0.52705,-0.42009 -1.18651,-0.67505 -1.86223,-0.69272 -0.88321,-0.0415 -1.80089,0.23479 -2.45006,0.85014 -0.98706,0.90991 -1.3107,2.4436096 -0.80994,3.6839696 0.31622,0.80565 0.99263,1.45595 1.80613,1.74908 -0.13212,2.79131 -0.26424,5.58262 -0.39635,8.37394 -1.11038,-1.17841 -2.21306,-2.36721 -3.32031,-3.55052 0.37053,-0.60414 0.56467,-1.33638 0.43655,-2.04223 -0.13805,-0.855 -0.65731,-1.63053 -1.37379,-2.11128 -0.53552,-0.38509 -1.19706,-0.59929 -1.8585604,-0.56352 -0.82358,0.0294 -1.63406,0.38923 -2.1898,1.00131 -0.7925,0.8347 -1.09545,2.13263 -0.66865,3.21368 0.31299,0.80698 0.91671,1.52654 1.72607,1.86484 0.21675,0.0947 0.4445,0.16304 0.67611,0.21038 1.6542304,3.9796 3.3080404,7.69226 4.9653504,11.67054 0.12692,0.27262 0.4634,0.38764 0.74446,0.31648 1.0921,-0.13021 2.20141,-0.22828 3.30874,-0.2848 1.10024,-0.0603 2.22776,-0.0664 3.34002,-0.0901 0.72206,-0.0134 1.44432,-0.0303 2.16629,-0.004 0.69582,0.0169 1.40817,0.0477 2.10464,0.0881 1.1049,0.0637 2.20047,0.15977 3.30374,0.28291 0.19103,0.0344 0.40373,0.0341 0.56384,-0.0919 0.2045,-0.13464 0.25509,-0.38535 0.35011,-0.59386 1.6036,-3.85368 3.20721,-7.4407 4.81082,-11.29439 0.3942,-0.0598 0.76385,-0.2297 1.10156,-0.43646 0.49525,-0.3124 0.89315,-0.76931 1.1429,-1.29832 0.34849,-0.6895 0.4791,-1.51337 0.23801,-2.25877 -0.1932,-0.61687 -0.57996,-1.16639 -1.06598,-1.58832 -0.61365,-0.50918 -1.42513,-0.80521 -2.22609,-0.70982 -0.9347,0.0913 -1.82686,0.60421 -2.34448,1.393 -0.38752,0.55993 -0.62857,1.24244 -0.56719,1.92936 0.036,0.49322 0.20388,0.97335 0.46606,1.39147 -1.10893,1.18272 -2.21787,2.36544 -3.32681,3.54817 -0.13725,-2.78405 -0.25998,-5.56879 -0.39167,-8.35311 0.90882,-0.32857 1.63773,-1.11207 1.89409,-2.04475 0.23915,-0.78944 0.21709,-1.6792596 -0.17282,-2.4178196 -0.27673,-0.53676 -0.6968,-0.99716 -1.19262,-1.33934 -0.57912,-0.36782 -1.27593,-0.52691 -1.95781,-0.50302 z`,
                fill: `none`,
            }),
            m('path', {
                d: `m 21.668874,30.885959 c -1.90977,0.0104 -3.82102,0.0864 -5.71941,0.30208 -0.9977,0.10228 -2.00935,0.24893 -2.93395,0.65703 -0.66835,0.29557 -1.24726,0.80585 -1.58225,1.45963 -0.27812,0.5196 -0.40277,1.10564 -0.44509,1.68958 -0.0692,0.76042 -0.0811,1.52545 -0.0448,2.28802 0.0694,0.12562 0.1024,0.28655 0.24435,0.35476 0.17718,0.0974 0.38305,0.10161 0.58017,0.0909 7.10566,0.003 14.2114,2.7e-4 21.31709,4e-4 0.34382,0.002 0.62789,-0.33562 0.59018,-0.67271 0.005,-0.9084 10e-4,-1.82326 -0.15049,-2.72132 -0.15847,-0.82671 -0.60199,-1.61295 -1.29147,-2.1094 -0.58605,-0.43954 -1.30233,-0.65539 -2.01354,-0.78911 -0.71507,-0.15641 -1.43906,-0.27752 -2.17044,-0.32104 -2.12159,-0.17663 -4.2517,-0.24161 -6.38036,-0.22885 z`,
                fill: `none`,
            }),
        ]
    );
}
