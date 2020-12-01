export default class LeageAPICaller{

    constructor()
    {
        
    }

    async getAccount(summonerName)
    {
        if(summonerName){
            const account_response = await fetch('/api',{ method: 'POST', headers: {'Content-Type' : 'text/plain' }, body: summonerName});
            const account_data = await account_response.json();
            return account_data;
        }
        else 
            throw new Error("Null String");
    };


    async getRankedInfoByID(summonerID)
    {
        if(summonerID){
            const ranked_response = await fetch('/api/ranked',{ method: 'POST', headers: {'Content-Type' : 'text/plain' }, body: summonerID});
            const ranked_data = await  ranked_response.json();
            return ranked_data;
        }
        else 
            throw new Error("Null String");
    }

    //NOT WORKING
    async getRankedInfoByName(summonerName)
    {
        if(summonerName){
            let account = await getAccount(summonerName);
            const ranked_response = await fetch('/api/ranked',{ method: 'POST', headers: {'Content-Type' : 'text/plain' }, body: account.summonerID});
            const ranked_data = await  ranked_response.json();
            return ranked_data;
        }
        else 
            throw new Error("Null String");
    }


    async getCurrentGame(summonerID)
    {
        if(summonerID){
            const spectator_response = await fetch('/api/currentGame',{ method: 'POST', headers: {'Content-Type' : 'text/plain' }, body: summonerID});
            const spectator_data = await spectator_response.json();
            return spectator_data;
        }
        else
            throw new Error("Null String")
    }

    async pull_champion_rates()
    {
        const champion_roles_response = await fetch('/api/playerRoles',{ method: 'POST', headers: {'Content-Type' : 'text/plain' }});
        const champion_roles_data = await champion_roles_response.json();
        return champion_roles_data;

    }

    async getMatchHistory(summonerID)
    {
        const matchHistory_response = await fetch('/api/matchHistory',{ method: 'POST', headers: {'Content-Type' : 'text/plain' }, body: summonerID});
        const matchHistory_data = await matchHistory_response.json();
        return matchHistory_data;
    }

}
