const connerction = require('../database/connection');

module.exports= {
    async index(request, response) {
        const { page = 1 } = request.query;

        const [count] = await connerction('incidents').count('id');


        const incidents = await connerction('incidents')
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
        .limit(5)
        .offset((page -1) * 5)
        .select([
            'incidents.*',
            'ongs.name',
            'ongs.email',
            'ongs.whatsapp',
            'ongs.city',
            'ongs.uf'
        ]);

        response.header('X-Total-Count', count['count(`id`)']);

        return response.json(incidents);
    },
    async create(request, response) {
        const {title, description, value } = request.body;
        const ong_id = request.headers.authorization;

        const [id] = await connerction('incidents').insert ({
            title,
            description,
            value,
            ong_id,
        });
        return response.json({ id });
    },
    async delete(request,response){
        const { id } = request.params;
        const ong_id = request.headers.authorization;

        const incident = await  connerction('incidents')
        .where('id', id)
        .select('ong_id')
        .first();

        if(incident.ong_id != ong_id) {
            return response.status(401).json({ error: 'Operation not permitted.'});
        }

        await connerction('incidents').where('id', id).delete();

        return response.status(204).send();
    }

};