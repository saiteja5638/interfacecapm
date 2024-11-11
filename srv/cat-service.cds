using {ConfigProd as external} from './external/ConfigProd.csn';

service ConfigService @(impl: './cat-service.js') @(requires: 'authenticated-user') {

   entity getLocProdCharAPI          as projection on external.getLocProdCharAPI;
   entity getLocProdConfigAPI        as projection on external.getLocProdConfigAPI;
   // Location/Product/Act/Demand
   entity getLocProdActDemandAPI     as projection on external.getLocProdActDemandAPI;
   entity getLocProdActualDemandAPI  as projection on external.getLocProdActualDemandAPI;
   entity getLocProdActDemandAPICopy as projection on external.getLocProdActDemandAPI;
   entity getClassCharAPI            as projection on external.getClassCharAPI;
   // API of Master Data for Assembly
   entity getMDTAssembly             as projection on external.getMDTAssembly;
   action generateUniqueId(vcRulesList : array of external.cp_ds_UniqueIdDetails) returns external.cp_ds_uniqueIDFnResponse;
}
