export interface Player {
    source: string;
    data: Data;
}

export interface Data {
    stateId: string;
    steam: string;
    discord: string;
    license: string;
    ip: string;
    name: string;
    character: { [key: string]: any };
    skin: { [key: string]: any };
    meta: { [key: string]: any };
    employment: [];
    position: Position;
    money: Money;
    created: Number;
    deleted: Number;
}

export type Money = {
    paycheck: number;
    types: { [key: string]: any };
};

export type Position = {
    x: number;
    y: number;
    z: number;
    h?: number;
};
