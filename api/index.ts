function getHost() {
    switch(window.location.hostname){
        case "172.30.10.120":
            return "172.30.10.120";
        default:
            return 'vjweb.dskorea.com';
    }
}

const mapURL = getHost();
const baseURL = `https://${mapURL}:9091/`;

export const fetchUserURL = `${baseURL}api/common/employee-info`;
export const fetchURL = `${baseURL}api/call-procedure`;