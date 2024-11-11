using app.db from '../db/interactions';
using {SELECTIONOPTIONS} from '../db/interactions';
using {CONFIGOPTIONS} from '../db/interactions';



@cds.query.limit: {
    default: 100,
    max    : 9000
}
@(requires: 'authenticated-user')
service CatalogService {
    // @requires: 'authenticated-user'
    entity LOCATION               as projection on db.LOCATION; //location
    entity LOCATION_IBP           as projection on db.LOCATION_IBP; //location_ibp
    entity SALES_HIS              as projection on db.SALES_HIS2; //sales history
    entity SALES                  as projection on db.SALES2; //sales
    entity PRODUCT                as projection on db.PRODUCT; //product
    entity DERIVECHAR             as projection on db.DERIVECHAR; //derivecharacter
    entity MAT_LTE_MDATA          as projection on db.MAT_LTE_MDATA; //materiallitemdata
    entity CUSTOMERS              as projection on db.CUSTOMERS; //customersSXS
    entity LOC_PRODID             as projection on db.LOC_PRODID; //locationandproduct
    entity PROD_CLASS             as projection on db.PROD_CLASS; //productandclass
    entity CLASS_C                as projection on db.CLASS_C; //class
    entity CHARC_DATA             as projection on db.CHARC_DATA; //characterdata
    entity CHARAC_VALUES          as projection on db.CHARAC_VALUES; //charactervalues
    entity PROD_CONFIG            as projection on db.PROD_CONF; //productconfiguration
    entity BOM_STAG               as projection on db.BOM_STAG; //bomstagging
    entity BOM_DEPN               as projection on db.BOM_DEPN; //bom dependency
    entity BOM_OBJ_DEPEN          as projection on db.BOM_OBJ_DEPEN; //bomobjectdependecy
    entity ASS_COMP               as projection on db.ASS_COMP; //assemblecomponent
    entity OBJ_DEPEN_MAS_DATA     as projection on db.OBJ_DEPEN_MAS_DATA; //objectdependencymasterdata
    entity MAST_DATA_NODE         as projection on db.MAST_DATA_NODE; //masterdatanode
    entity PVBLL_MAT              as projection on db.PVBLL_MAT; //pvbillmaterial
    entity PROD_ACC_NODE          as projection on db.PROD_ACC_NODE; //productaccessnode
    entity MAINT_MRP              as projection on db.MAIN_MRP; //maintain mrp


    //standby tables
    entity LOCATION_STB           as projection on db.LOCATION_STB; //location_standby
    entity PRODUCT_STB            as projection on db.PRODUCT_STB; //product_stb
    entity DERIVECHAR_STB         as projection on db.DERIVECHAR_STB; //derive_stb characteristcs
    entity customer_group         as projection on db.customer_group; // customers_stb
    entity MAINT_MRP_STB          as projection on db.MAIN_MRP_STB; // maintain mrp_stb

    // PRODUCT AND ATTRIBUTES EXTRACT stand by
    entity CLASS_C_STB            as projection on db.CLASS_C_STB;
    entity PROD_CLASS_STB         as projection on db.PROD_CLASS_STB;
    entity CHARC_DATA_STB         as projection on db.CHARC_DATA_STB;
    entity CHARAC_VALUES_STB      as projection on db.CHARAC_VALUES_STB;
    //bill of materials stand_by
    entity BOM_STAG_STB           as projection on db.BOM_STAG_STB; // bomstagging_stb
    entity BOM_DEPN_STB           as projection on db.BOM_DEPN_STB; //bomdependcy_stb
    entity BOM_OBJ_DEPEN_STB      as projection on db.BOM_OBJ_DEPEN_STB; //bomobjdependency
    entity ASS_COMP_STB           as projection on db.ASS_COMP_STB; // assumble_stb

    // Partial_product stand by
    entity PROD_CONF_STB          as projection on db.PROD_CONF_STB; //product cnfiguration_standby
    entity MAT_LTE_MDATA_STB      as projection on db.MAT_LTE_MDATA_STB; //materiallitemdata
    entity LOC_PRODID_STB         as projection on db.LOC_PRODID_STB; //locationandproduction

    // SALES ORDER STAND BY
    entity SALES_STB              as projection on db.SALES1_STB2; //sales_stb
    entity SALES_HIS_STB          as projection on db.SALES_HIS_STB2; //sales_his_stb

    // ippe extract
    entity MAST_DATA_NODE_STB     as projection on db.MAST_DATA_NODE_STB;
    entity PVBLL_MAT_STB          as projection on db.PVBLL_MAT_STB;
    entity OBJ_DEPEN_MAS_DATA_STB as projection on db.OBJ_DEPEN_MAS_DATA_STB;
    entity PROD_ACC_NODE_STB      as projection on db.PROD_ACC_NODE_STB;
    // SERVICE INTERFACE
    entity config_interface_log   as projection on CONFIGOPTIONS;
    entity INTERFACE_TABLE        as projection on db.INTERFACE_TABLE;
    entity CONFIG_INT_TAB         as projection on db.CONFIG_INT_TAB1;
    entity interface_log_table    as projection on db.interface_log_table;
    // interface_tables
    entity Options                as projection on SELECTIONOPTIONS;
    entity INTERFACE_TYPE         as projection on db.INTERFACE_TYPE;
    entity INTERFACE_PARAMS       as projection on db.INTERFACE_PARAMS;
    entity INTERFACE_PARAMS_VALUE as projection on db.INTERFACE_PARAMS_VALUE;
    entity INTERFACE_SERV_CONFIG  as projection on db.INTERFACE_SERV_CONFIG;
    entity interface_ext_log      as projection on db.interface_ext_log;
    entity Data_S4                as projection on db.Data_S4;
    entity Config_Job_Status      as projection on db.Config_Job_Status;
    // JOBS
    function getJobFeedLog(jobName : String)                        returns String;
    // action   executeJobFeed(jobFeedName : String);
    function createJobFeed(jobFeedName : String, userName : String) returns String;
    function getJobFeedData() returns String;
    // interface functions
    function VC_interface(FLAG : String, Data : String)             returns String;
    function deleteInterfaceLogs()                                  returns String;
    function process_dependency(UID : String, OD : String)          returns String;
}
