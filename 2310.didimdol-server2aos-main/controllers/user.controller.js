const qs = require('qs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const func_token = require('../middlewares/authToken');
const func_link = require('../middlewares/kakaoLinkUnlink');
const UserService = require('../services/user.service');

//카카오 로그인 관련 모듈
exports.kakao = {
    //카카오에서 발급한 인가코드 
    sendCode: async (req, res) => {
        const { session, query } = req;
        const { code } = query;
        let tokenResponse;

        try {
            // Authorization Server 부터 Access token 발급받기
            tokenResponse = await axios({
                method: "POST",
                url: 'https://kauth.kakao.com/oauth/token',
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                data: qs.stringify({
                    grant_type: "authorization_code",
                    client_id: process.env.KAKAO_ID,
                    client_secret: process.env.KAKAO_SECRET_KEY,
                    redirect_uri: process.env.KAKAO_REDIRECT,
                    code
                })
            });
        } catch (error) {
            return res.json(error.data);
        }

        console.info("==== tokenResponse.data ====");
        console.log(tokenResponse.data);

        //카카오 발급 access token
        const { access_token } = tokenResponse.data;

        try {
            //카카오 서버에 access_token으로 사용자 정보 요청하기
            userResponse = await axios({
                method: "GET",
                url: "https://kapi.kakao.com/v2/user/me",
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
        } catch (error) {
            return res.json(error.data);
        }

        //사용자 데이터 정보 가져오기
        console.info("==== userResponse.data ====");
        console.log(userResponse.data);

        const authData = {
            ...userResponse.data
        };

        try {
            const result = func_link.kakao.linkUser(session, "kakao", authData);

            if (result) {
                console.log('*********************************************', result);
                const email = authData.kakao_account.email;
                const check_user = await UserService.checkUser(email);

                //이미 가입된 사용자(내부 서버 DB 조회)
                if (check_user == 1) {
                    var userInfo = await UserService.getUser(email);
                    userInfo = userInfo[0];
                    //서버 내부 access token 정보 확인_사용자 인증
                    const token = userInfo.token;
                    const user_id = userInfo.id;
                    //access token 재발급
                    const access_token = await func_token.generate_access_token(email);
                    //refresh token 재발급
                    const refresh_token = await func_token.generate_refresh_token(email);
                    //재발급한 refresh token DB에 저장
                    const store_refresh_token = await UserService.updateUser(user_id, refresh_token);

                    // console.log('check_user == 1');
                    // console.log('userInfo.token', userInfo.token);
                    // console.log('userInfo.user_id', userInfo.user_id);
                    // console.log('access_token', access_token);
                    // console.log('refresh_token', refresh_token);

                    //DB UPDATE 성공
                    if (store_refresh_token != -1) {
                        //성공(200) & access token 반환
                        return res.status(200).json({
                            'access_token': access_token
                        })
                    }
                    //DB UPDATE 실패(304)
                    else {
                        return res.status(304).send('Not Modified');
                    }
                }

                //가입되지 않은 사용자
                else {
                    const user_id = authData.id;
                    const email = authData.kakao_account.email;
                    const provider = 'kakao';
                    //내부 서버 access token 생성
                    const access_token = await func_token.generate_access_token(email);
                    //refresh token 재발급
                    const refresh_token = await func_token.generate_refresh_token(email);

                    // const store_refresh_token = await UserService.updateUser(user_id, refresh_token);

                    // const jwt_token = func_token.generate_token(email);
                    //재발급한 refresh token DB에 저장
                    const insertUser = await UserService.insertUser(user_id, email, provider, refresh_token);
                    // console.log(jwt_token);
                    // res.json(jwt_token);
                    //성공(200) & access token 반환
                    return res.status(200).json({
                        'access_token': access_token
                    });
                }

                // res.redirect('/user/?email=' + email);
                // req.session.loginData = userResponse.data;
                // console.info("계정에 연결되었습니다.");

                // return req.session.save(() => {
                //     res.send({ loggedIn: true, loginDate: authData });
                //     // res.redirect('/');
                // });

            } else {
                //가입 정보 없는 사용자(404)
                return res.status(404).json('Do Not Found User');
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json('Internal Server Error Occured')
        }
    },
    /*
        linkAccount: async (req, res) => {
            const { access_token } = tokenResponse.data;
    
            let userResponse;
            try {
                // access_token 으로 사용자 정보 요청하기
                userResponse = await axios({
                    method: "GET",
                    url: "https://kapi.kakao.com/v2/user/me",
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
    
            } catch (error) {
                return res.json(error.data);
            }
    
            console.info("==== userResponse.data ====");
            console.log(userResponse.data);
    
            const authData = {
                ...tokenResponse.data,
                ...userResponse.data
            };
    
            const result = func_link.kakao.linkUser(session, "kakao", authData);
            // console.log(reseult)
            if (result) {
                console.log('*********************************************', result);
                // res.
                // res.cookie('user_id', authData.id);
                const email = userResponse.data.kakao_account.email;
                const check_user = await UserService.getUser(email);
    
                if (check_user == 0) {
                    res.redirect('/user')
                }
                else {
                    res.redirect('/user/register')
                }
    
                // res.redirect('/user/?email=' + email);
                // req.session.loginData = userResponse.data;
                console.info("계정에 연결되었습니다.");
    
                // return req.session.save(() => {
                //     res.send({ loggedIn: true, loginDate: authData });
                //     // res.redirect('/');
                // });
    
            } else {
                console.warn("이미 연결된 계정입니다.");
                // res.redirect('/user/check/?email=' + email);
    
            }
    
        },
    
        unlinkAccount: async (req, res) => {
            const { session } = req;
    
            const { access_token } = session.authData.kakao;
    
            let unlinkResponse;
            try {
                unlinkResponse = await axios({
                    method: "POST",
                    url: "https://kapi.kakao.com/v1/user/unlink",
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
            } catch (error) {
                return res.json(error.data);
            }
    
            console.log("==== unlinkResponse.data ====");
            console.log(unlinkResponse.data);
    
            const { id } = unlinkResponse.data;
            const result = func_link.kakao.unlinkUser(session, "kakao", id);
    
            if (result) {
                console.log("연결 해제되었습니다.");
            } else {
                console.log("카카오와 연동된 계정이 아닙니다.");
            }
            res.redirect("/");
        },
    */
    getToken: async (req, res) => {
        const access_token = req.params.token;
        console.log(access_token);
        let userResponse;
        try {
            console.log(access_token);

            //카카오 access_token으로 사용자 정보 요청하기
            userResponse = await axios({
                method: "GET",
                url: "https://kapi.kakao.com/v2/user/me",
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

        } catch (error) {
            console.log(error);
            return res.status(400).send('Bad Request');
        }

        // console.info("==== userResponse.data ====");
        // console.log(userResponse.data);

        //카카오에서 가져온 사용자 정보 불러오기
        const authData = {
            ...userResponse.data
        };
        const { session, query } = req;
        const result = func_link.kakao.linkUser(session, "kakao", authData);

        //서버 DB 사용자 정보 확인
        if (result) {
            console.log('*********************************************', result);
            const email = authData.kakao_account.email;
            const check_user = await UserService.getUser(email);
            console.log('check_user', check_user)

            //1. 가입된 사용자
            if ((check_user != -1) && (check_user != -2)) {
                try {
                    var userInfo = await UserService.getUser(email);
                    userInfo = userInfo[0];
                    const token = userInfo.token;
                    const user_id = userInfo.user_id;
                    const access_token = await func_token.generate_access_token(email);
                    const refresh_token = await func_token.generate_refresh_token(email);
                    const store_refresh_token = UserService.updateUser(user_id, refresh_token);

                    //리프레시 토큰 업데이트 
                    if (store_refresh_token != -1) {
                        res.cookie('access_token', access_token);
                        return res.status(200).json({
                            'user_info': {
                                'user_id': user_id,
                                'email': email,
                                'access_token': access_token
                            }
                        })
                    }

                    //토큰 업데이트 실패
                    else {
                        return res.status(305).send('Not modified');
                    }
                } catch (err) {
                    console.log(err);
                    return res.status(500).send('Internal Server Error occured');
                }
            }


            //2. 미가입자(DB에 없는 사용자)
            else {
                try {
                    const user_id = authData.id;
                    const email = authData.kakao_account.email;
                    const provider = 'kakao';

                    const access_token = await func_token.generate_access_token(email);
                    const refresh_token = await func_token.generate_refresh_token(email);
                    const insertUser = await UserService.insertUser(user_id, email, provider, refresh_token);

                    if (insertUser != -1) {
                        res.cookie('access_token', access_token);
                        // return res.status().send('Created');

                        return res.status(201).json({
                            'user_info': {
                                'user_id': user_id,
                                'email': email,
                                'access_token': access_token
                            }
                        })
                    }

                    else {
                        return res.status(400).send('Bad Request');
                    }
                } catch (err) {
                    console.log(err);
                    return res.status(500).send('Internal Server Error occured');
                }

            }

            // res.redirect('/user/?email=' + email);
            // req.session.loginData = userResponse.data;
            // console.info("계정에 연결되었습니다.");

            // return req.session.save(() => {
            //     res.send({ loggedIn: true, loginDate: authData });
            //     // res.redirect('/');
            // });

        } else {
            console.warn("이미 연결된 계정입니다.");
        }
    }
}

//내부 서버 토큰 인증 모듈
exports.auth = {
    check_token: async (req, res, next) => {
        // console.log(req.body.access_token);

        if (req.headers.access_token) {
            const access_token = req.headers.access_token;
            console.log(access_token);
            var email;

            try {

                const decode_token = jwt.verify(req.headers.access_token, process.env.JWT_TOKEN_SECRET);
                email = decode_token.email;
                console.log(email);
            } catch (err) {
                console.log(err.name)
                if ((err.name === 'JsonWebTokenError') || (err.name === 'TokenExpiredError')) {
                    return res.status(401).send('Unauthorized');
                }
                else {
                    return res.status(500).send('Internal Server Error occured');
                }
            }
            //1. access token verified
            const verified_at = await func_token.verify_access_token(access_token);
            console.log(verified_at);
            var userInfo = await UserService.getUser(email);
            userInfo = userInfo[0];
            console.log(userInfo);
            const user_id = userInfo.user_id;

            if (verified_at) {
                const re_access_token = await func_token.generate_access_token(email);
                const re_refresh_token = await func_token.generate_refresh_token(email);
                const updateToken = await UserService.updateUser(user_id, re_refresh_token);

                console.log('re_access_token');
                console.log('user_id');

                if (updateToken != -1) {
                    // res.cookie('user_id', user_id);
                    // req.cookies.user_id = user_id;

                    // res.cookie('access_token', re_access_token);
                    // req.cookies.access_token = re_access_token;

                    // res.cookie('email', email);
                    // req.cookies.email = email;
                    next();
                }
                else {
                    return res.status(401).send('Unauthorized');
                }
            }

            //2. access token : expired && refresh token : verified
            else {
                const refresh_token = userInfo.token;
                const verify_refresh_token = await func_token.verify_refresh_token(refresh_token);
                console.log(func_token.verify_refresh_token)
                try {
                    if (verify_refresh_token) {
                        const re_access_token = await func_token.generate_access_token(email);
                        res.cookie('user_id', user_id);
                        res.cookie('access_token', re_access_token);
                        next();
                    }

                    //3. access token : expired && refresh token : expired
                    else {
                        return res.status(401).send('expired token');
                    }
                } catch (err) {
                    console.log(err);
                    return res.status(500).send('Internal Server Error occured');
                }
            }



            // if (verify_token) {
            //     // req.user = userInfo[0];
            //     const jwt_token = func_token.generate_token(email);
            //     // console.log(req.user);
            //     const updateToken = await UserService.updateUser(user_id, jwt_token);

            //     if (updateToken != -1) {
            //         // req.user = user;
            //         res.cookie('user', userInfo[0]);
            //         return res.status(200).json('success');
            //     }
            // }


        }

        else {
            return res.status(400).send('Bad request');
        }
    }
}

/***
//로그인 관련 모듈
exports.login = {
    //
    postUser: async (req, res) => {
        const { accessToken } = req.body;
        let kakaoProfile;

        try {
            console.log(accessToken);
            kakaoProfile = await axios.get('https://kapi.kakao.com/v2/user/me', {
                headers: {
                    Authorization: 'Bearer' + accessToken,
                    'Content-Type': 'application/json'
                }
            });
            console.log(kakaoProfile);
        } catch (err) {
            return res.send('accesstoken error');
        }
    },

    getKakaoToken: async (req, res) => {
        let ACCESSTOKEN;
        // const kakao_code = req.body.
        try {
            const url = 'https://kauth.kakao.com/oauth/token';
            const body = qs.stringify({
                grant_type: 'authorization_code',
                code: req.query.code
            });

            const header = { 'content-type': 'application/x-www-form-urlencoded' };
            const response = await axios.post(url, body, header);
            ACCESSTOKEN = response.data.access_token;
            res.send('susccess');
        } catch (e) {
            console.log(e.message);
            res.send('error');
        }


        try {
            const url = 'https://kapi.kakao.com/v2/user/me';
            const header = {
                headers: {
                    Authorization: `Beared ${ACCESSTOKEN}`
                }
            };

            const response = await axios.get(url, header);
            console.log(response.data.properties);
            const payload = { nickname };
            const access_token = makeJwt(payload);
            console.log(access_token);
            res.cookie('userToken', access_token).redirect('/');
        } catch (err) {
            console.log(err);

        }

        // const header = require
        // if (req.query.code) {
        //     const code = req.query.code
        //     let options = {
        //         url: 'https://kauth.kakao.com/oauth/token',
        //         method: 'post',
        //         headers: {
        //             "Content-Type": "application/x-www-form-urlencoded"
        //         },
        //         data: qs.stringify({
        //             grant_type: 'authorization_code',
        //             client_id: process.env.KAKAO_ID,
        //             redirect_uri: process.env.KAKAO_REDIRECT,
        //             code: code
        //         })
        //     }
        //     let result = 'fail'
        //     axios(options)
        //         .then(function (response) {
        //             if (response.status === 200) {
        //                 const token = response.data.access_token
        //                 console.log(`token : ${token}`)
        //                 result = 'success'
        //                 return true
        //             }
        //         }).catch(function (err) {
        //             console.log(`main getCode err : ${err}`)
        //             result = 'failed'
        //             return false
        //         })
        //         .then(function () {
        //             const url = `${redirect}result/${result}`
        //             res.redirect(url)
        //         })
        // } else {
        //     res.status(200).json({ 'msg': `ICE ALERT MAIN PAGE` })
        // }
    },
    returnCodeAPI: async (req, res) => {
        try {
            url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_ID}&redirect_uri=${process.env.KAKAO_REDIRECT}`
            console.log(req.query.code);
            res.redirect(url)
        } catch (e) {
            console.log(e)
        }
    },

    // getResult: async (req, res) => {
    //     try {
    //         console.log(req.params.result)
    //         if (req.params.result === 'success') {
    //             res.status(200).json({ 'msg': `등록이 완료되었습니다` })
    //         } else {
    //             res.status(200).json({ 'msg': `등록에 실패했습니다` })
    //         }
    //     } catch (e) {
    //         console.log(e)
    //     }

    // },

    kakaoRecall: async (req, res) => {
        const { session, query } = req;
        const { code } = query;
        console.log(query);
        console.info("==== session ====");
        // console.log(session);
        // console.log(req);
        const url = `https://kauth.kakao.com/oauth/token`;

        let tokenResponse;
        try {
            tokenResponse = await axios({
                method: "POST",
                url,
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                data: qs.stringify({
                    grant_type: "authorization_code",
                    client_id: process.env.KAKAO_ID,
                    client_secret: process.env.KAKAO_SECRET_KEY,
                    redirect_uri: process.env.KAKAO_REDIRECT,
                    code
                })
            });
        } catch (error) {
            return res.json(error.data);
        }

        console.info("==== tokenResponse.data ====");
        console.log(tokenResponse.data);

        const { access_token } = tokenResponse.data;

        let userResponse;

        try {
            userResponse = await axios({
                method: "GET",
                url: "https://kapi.kakao.com/v2/user/me",
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
        } catch (error) {
            return res.json(error.data);
        }

        console.info("==== userResponse.data ====");
        console.log(userResponse.data);

        const authData = {
            ...tokenResponse.data,
            ...userResponse.data
        };

        const result = linkUser(session, "kakao", authData);

        if (result) {
            console.info("계정에 연결되었습니다.");
        } else {
            console.warn("이미 연결된 계정입니다.");
        }

        res.redirect("/");
    }
}

exports.local = {
    checkUser: async (req, res) => {
        const email = req.params.email;
        const findUser = await UserService.getUser(email);
        if (findUser != -1) {
            return res.stauts(200).json('success');
        }
        else {
            return res.status(400).json('fail');
        }
    },

    registerUser: async (req, res) => {
        const email = req.params.email;
        const signUpUser = await UserService.insertUser()
    }
}

 */