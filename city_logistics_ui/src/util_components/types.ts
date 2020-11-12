export type Location = {
    lat: number,
    lon: number
}

export type Address = Location & {
    street: string,
    street_address: string,
    postal_code: string,
    city: string,
    country: string
}

export type LocationTuple = [number, number] | number[]

