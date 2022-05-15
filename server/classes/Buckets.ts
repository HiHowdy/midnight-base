class BucketManager {
    public players: { [key: string]: number };
    public entities: { [key: string]: number };

    public setPlayerBucket(source: string, bucket: number) {
        SetPlayerRoutingBucket(source, bucket);
        this.players[source] = bucket;
    }

    public setEntityBucket(entity: number, bucket: number) {
        SetEntityRoutingBucket(entity, bucket);
        this.entities[entity] = bucket;
    }

    public addEntityToPlayerBucket(entity: number, source: string) {
        const bucket = GetPlayerRoutingBucket(source);
        SetEntityRoutingBucket(entity, bucket);
        this.entities[entity] = bucket;
    }
}

const Buckets = new BucketManager();

export const setPlayerBucket = (source: string, bucket: number) =>
Buckets.setPlayerBucket(source, bucket);
global.exports('setPlayerBucket', setPlayerBucket);

export const setEntityBucket = (entity: number, bucket: number) =>
    Buckets.setEntityBucket(entity, bucket);
global.exports('setEntityBucket', setEntityBucket);

export const addEntityToPlayerBucket = (entity: number, source: string) =>
    Buckets.addEntityToPlayerBucket(entity, source);
global.exports('AddEntityToPlayerBucket', AddEntityToPlayerBucket);
