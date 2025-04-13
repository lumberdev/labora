import type { Feature, MultiPolygon, Polygon } from 'geojson'

export type CountryFeature = Feature<Polygon | MultiPolygon> & {
  id: string
}

export type CountryGeometry = Polygon | MultiPolygon

export type Coordinates = number[]
export type Ring = Coordinates[]
export type PolygonCoordinates = Ring[]
export type MultiPolygonCoordinates = PolygonCoordinates[]
