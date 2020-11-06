import { createSourceFile, ScriptTarget, SyntaxKind } from 'typescript'; 
import CreateIoc from './ioc';
import "reflect-metadata";
const TYPES: IType = {
    indexService: Symbol.for("indexService")
}
const container = new CreateIoc();
class IndexService {
    log(str: string) {
        console.log(str);
    }
}
container.bind(TYPES.indexService, IndexService);
@controller
class IndexController {
    private indexService: IIndexService;
    constructor(@inject(TYPES.indexService) indexService?: IIndexService) {}
    info() {
        this.indexService.log("测试")
    }
}

function inject(serviceIdent: Symbol): Function {
    return (target: Function, targetKey: string) => {
        if(!targetKey) {
            try {
                Reflect.defineMetadata(serviceIdent, container.use(serviceIdent), target);
            } catch (error) {
                console.log(error);
                
            }
          
        }
    }
}

// 常量区
interface IType {
    [key: string]: Symbol
}

// 获取函数的参数
function getParams(fn: Function) {
    let ast = createSourceFile('_.ts', fn.toString(), ScriptTarget.Latest, true);
    const nodes = ast.getChildren()[0].getChildren();
    const serviceParams = []
    nodes.forEach((item: any) => {
        if(item.kind == SyntaxKind.FunctionDeclaration) {
            item.parameters.forEach((itemChild) => {
                serviceParams.push(itemChild.name.escapedText);
            });
        }
    })
    return serviceParams;
}

function controller<T extends {new (...args: any[]): {}}>(constructor:T) {
    class controller extends constructor {
        constructor(...args: any[]) {
            super(args);
            const serviceParams = getParams(constructor);
            for (const iterator of serviceParams) {
                this[iterator] = Reflect.getMetadata(TYPES[iterator], constructor);
            }  
        }
    }
    return controller;
}

interface IIndexService {
    log(str: string): void;
}

// ① 最愚蠢的办法
// const indexService = new IndexService();
// indexService.log("测试")
// ② 好一点
// const instance = new IndexController(new IndexService());
// 想要的
// ③ 不传还想要 彻底解耦
const instance = new IndexController();//  不传入service
instance.info();

