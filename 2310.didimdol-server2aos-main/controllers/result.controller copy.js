const ResultService = require('../services/result.service');

//전체 검사 리스트
exports.CheckList = {
    //검사 결과 조회
    getResult: async (req, res) => {
        try {
            if ((req.params.user_id) && (req.params.page_no) && (req.params.limit)) {
                const user_id = req.params.user_id;
                const page_no = req.params.page_no;
                const limit = req.params.limit;

                //결과 조회
                const all_result = await ResultService.ResultList.getResultList(user_id, page_no, limit);

                //성공(200)
                if (all_result != -1) {
                    return res.status(200).json({
                        'check_result': all_result
                    });
                }
                //조회 실패
                else {
                    return res.status(400).send('bad request');
                }
            }
        } catch (err) {
            console.log(err);
            return res.status(500).send('internal error occurred')
        }
    },

    //상세 검사 결과
    getResultDetail: async (req, res) => {
        try {
            if (req.params.check_id) {
                //검사 번호 & 종류
                const check_id = req.params.check_id;
                const check_category = String(check_id).substring(0, 2);

                //시력검사
                if (check_category === 'vs') {
                    const vs_result = await ResultService.VisionCheck.get_result_check_no(check_id);

                    if (vs_result != -1) {
                        return res.status(200).json({
                            'vision_result': vs_result
                        });
                    }
                    //DB조회 실패
                    else {
                        return res.status(404).send('Do Not Found Result');
                    }
                }

                //암점자가인식검사
                else if (check_category === 'bs') {
                    //암점자가인식검사 전체 내역
                    const bs_result = await ResultService.BlindSpotCheck.get_result_check_no(check_id);
                    //암점자가인식 좌안검사 결과
                    const bs_left_result = await ResultService.BlindSpotCheck.get_left_detail_result(check_id);
                    //암점자가인식 우안검사 결과
                    const bs_right_result = await ResultService.BlindSpotCheck.get_right_detail_result(check_id);

                    if ((bs_result != -1) && (bs_left_result != -1) && (bs_right_result != -1)) {
                        //암점자가인식 vfi 좌안 결과
                        const bs_left_vfi = bs_result[0]['left_vfi'];
                        bs_left_result[0]['left_vfi'] = bs_left_vfi;

                        //암점자가인식 vfi 우안 결과
                        const bs_right_vfi = bs_result[0]['right_vfi'];
                        bs_right_result[0]['right_vfi'] = bs_right_vfi;

                        //성공(200)
                        return res.status(200).json({
                            'left_blind_spot_result': bs_left_result,
                            'right_blind_spot_result': bs_right_result
                        });
                    }

                    //DB조회 실패
                    else {
                        return res.status(404).send('Do Not Found Result');
                    }
                }

                //안구이동검사
                else if (check_category === 'em') {
                    const em_result = await ResultService.EyeMovementCheck.get_result_check_no(check_id);
                    const em_left_result = await ResultService.EyeMovementCheck.get_left_result(check_id);
                    const em_right_result = await ResultService.EyeMovementCheck.get_right_result(check_id);

                    if ((em_result != -1) && (em_left_result != -1) && (em_right_result != -1)) {
                        const em_left_vfi = em_result[0]['left_vfi'];
                        const em_right_vfi = em_result[0]['right_vfi'];

                        em_left_result[0]['left_vfi'] = em_left_vfi;
                        em_right_result[0]['right_vfi'] = em_right_vfi;

                        //성공(200)
                        return res.status(200).json({
                            'left_eye_movement_result': em_left_result,
                            'right_eye_movement_result': em_right_result
                        });
                    }

                    //DB조회 실패
                    else {
                        return res.status(404).send('Do Not Found Result');
                    }
                }

                else {
                    return res.status(400).send('Bad Request');
                }
            }

        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error occured');
        }
    },

}

//시력검사 
exports.VisionCheck = {
    //결과출력 : user_id, page_no
    getResult: async (req, res) => {
        try {
            if (req.params.user_id) {
                const user_id = req.params.user_id;
                const vs_result = await ResultService.VisionCheck.get_result_user_id_page_no(user_id);

                if (vs_result != -1) {
                    return res.status(200).json({
                        'vision_result': vs_result
                    });
                }
                else {
                    return res.status(404).send('Not Found');
                }
            }
            else {
                return res.status(400).json('Bad Request');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error occured');
        }
    },

    //시력검사 그래프
    getGraphResult: async (req, res) => {
        try {
            if (req.params.user_id) {
                const user_id = req.params.user_id;
                const vs_result = await ResultService.VisionCheck.get_result_user_id(user_id);
                // const access_token = req.headers.access_token;

                if (vs_result != -1) {
                    return res.status(200).json({
                        'vision_result': vs_result
                    });
                }
                else {
                    return res.status(404).send('Not Found');
                }
            }
            else {
                return res.status(400).send('Bad Request');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error occured');
        }
    },

    //
    getResultDetail: async (req, res) => {
        try {
            if (req.body.check_vs_no) {
                const check_vs_no = req.body.check_vs_no;
                const vs_detail_result = await ResultService.VisionCheck.get_result_check_no(check_vs_no);

                if (vs_detail_result != -1) {
                    return res.status(200).send('success');
                }
            }
            else {
                return res.status(400).send('Bad Request');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error occured');
        }
    },


};

exports.BlindSpotCheck = {
    getResult: async (req, res) => {
        try {
            if ((req.params.check_id) && (req.params.user_id)) {
                const user_id = req.params.user_id;
                let bs_result = await ResultService.BlindSpotCheck.get_result_user_id(user_id);
                console.log('bs_result', bs_result);

                //전체 검사 내역          
                const check_id = req.params.user_id;
                const bs_detail_right_result = await ResultService.BlindSpotCheck.get_right_detail_result(check_id);
                const bs_detail_left_result = await ResultService.BlindSpotCheck.get_left_detail_result(check_id);

                console.log(bs_detail_right_result);
                console.log(bs_detail_left_result);
                // const bs_right_result;
                // const bs_left_result;
                // if (bs_result != -1) {
                //     // vs_result = JSON.stringify(vs_result);
                //     console.log(bs_result);
                //     // console.log(JSON.stringify(vs_result));
                //     return res.status(200).json({
                //         'blind_spot_result': bs_result
                //     });
                // }
            }
            else {
                return res.status(400).send('Bad Request');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error occured');
        }
    },

    getResultDetail: async (req, res) => {
        try {
            if (req.params.check_id) {
                const check_id = req.body.check_id;
                const bs_detail_result = await ResultService.BlindSpotCheck.get_result_check_no(check_id);

                if (bs_detail_result != -1) {
                    console.log(bs_detail_result);
                    return res.status(200).json({
                        'blank_spot_result': bs_detail_result
                    });
                }
            }
            else {
                return res.status(400).json('fail');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json('fail');
        }
    },

    getResultMonth: async (req, res) => {
        let data;

        if (req.cookies.user_id) {
            const user_id = req.cookies.user_id;
            const result_month = await ResultService.BlindSpotCheck.get_result_by_month(user_id);

            if (result_month != -1) {
                console.log(result_month);
                return res.status(200).json('success');
            }
            else {
                return res.status(400).json('fail');
            }
        }
        else {
            return res.status(404).json('do not find user_id');
        }
    }
};

exports.EyeMovementCheck = {
    getResult: async (req, res) => {
        try {
            if (req.cookies.user_id) {
                const user_id = req.cookies.user_id;
                let em_result = await ResultService.EyeMovementCheck.get_result_user_id(user_id);

                if (vs_result != -1) {
                    // vs_result = JSON.stringify(vs_result);
                    console.log(vs_result);
                    // console.log(JSON.stringify(vs_result));
                    return res.status(200).json({
                        'eye_movement_result': em_result
                    });
                }
            }
            else {
                return res.status(400).json('fail');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json('fail');
        }
    },

    getResultDetail: async (req, res) => {
        try {
            if ((req.params.check_id) && (req.params.user_id)) {
                const check_id = req.params.check_id;
                const user_id = req.params.user_id;
                const em_detail_result = await ResultService.EyeMovementCheck.get_result_detail(user_id, check_id);

                console.log(em_detail_result);
                if (em_detail_result != -1) {
                    console.log(em_detail_result);
                    return res.status(200).json('success');
                }
            }
            else {
                return res.status(400).json('fail');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json('fail');
        }
    },

    getResultMonth: async (req, res) => {
        let data;

        if (req.cookies.user_id) {
            const user_id = req.cookies.user_id;
            const result_month = await ResultService.BlindSpotCheck.get_result_by_month(user_id);

            if (result_month != -1) {
                console.log(result_month);
                return res.status(200).json('success');
            }
            else {
                return res.status(400).json('fail');
            }
        }
        else {
            return res.status(404).json('do not find user_id');
        }
    }
}


