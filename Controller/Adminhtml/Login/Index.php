<?php

namespace Loqate\Tag\Controller\Adminhtml\Login;

use Magento\Backend\App\Action\Context;
use Magento\Backend\App\AbstractAction;
use Magento\Framework\Controller\Result\JsonFactory;
use Loqate\Tag\Model\SettingsDataFactory;

class Index extends AbstractAction
{
    /**
     * @var SettingsDataFactory
     */
    protected $settingsDataFactory;

    /**
     * @var JsonFactory
     */
    protected $resultJsonFactory;

    /**
     * Index constructor.
     *
     * @param Context $context
     * @param JsonFactory $resultJsonFactory
     * @param SettingsDataFactory $settingsDataFactory
     */
    public function __construct(
        Context $context,
        JsonFactory $resultJsonFactory,
        SettingsDataFactory $settingsDataFactory
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->settingsDataFactory = $settingsDataFactory;
        return parent::__construct($context);
    }

    /**
     * @return \Magento\Framework\App\ResponseInterface|\Magento\Framework\Controller\Result\Json
     */
    public function execute()
    {
        
        $result = $this->resultJsonFactory->create();

        $accCode = $this->getRequest()->getParam('account_code');
        $accTok = $this->getRequest()->getParam('account_token');
        $vers = $this->getRequest()->getParam('module_version');
        
        $settings = $this->settingsDataFactory->create();
        
        try {
            $settings->setAccountCode($accCode);
            $settings->setAccountToken($accTok);
            $settings->setModuleVersion($vers);
            $settings->save();

            return $result->setData(['success' => true]);
        } catch (\Exception $ex) {
            return $result->setData(['success' => false, 'exception' => $ex->getMessage()]);
        }
    }
}
