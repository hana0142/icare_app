exports.kakao = {
    unlinkUser(session, provider, userId) {
        let result = false;

        if (
            session.authData &&
            session.authData[provider] &&
            session.authData[provider].id === userId
        ) {
            delete session.authData[provider];
            result = true;
        }
        return result;
    },


    linkUser(session, provider, authData) {
        let result = false;    // console.log('session', session);
        // console.log('*****authData', authData);
        if (session.authData) {
            if (session.authData[provider]) {
                // 이미 계정에 provider 가 연결되어 있는 경우
                user_id = session.authData.id;
                return result;
            }

            session.authData[provider] = authData;
        } else {
            session.authData = {
                [provider]: authData
            };
        }

        result = true;

        return result;
    }
}